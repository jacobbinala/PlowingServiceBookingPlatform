const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const { addClient, sendEvent, broadcastAvailabilityUpdate } = require('../services/slotEvents');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Missing or invalid authorization header' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { userId: payload.userId };
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function isValidDateString(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidTimeString(time) {
  return typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);
}

function generateDailySlotTimes() {
  // Simple default schedule: 06:00 through 18:00, hourly
  const times = [];
  for (let hour = 6; hour <= 18; hour++) {
    times.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return times;
}

function daysInMonth(year, month1to12) {
  return new Date(year, month1to12, 0).getDate();
}

async function ensureSlotsForDate(date) {
  const existing = await Slot.countDocuments({ date });
  if (existing > 0) return;

  const times = generateDailySlotTimes();
  const docs = times.map((time) => ({ date, time, capacity: 1, bookedCount: 0 }));
  try {
    await Slot.insertMany(docs, { ordered: false });
  } catch (e) {
    // Ignore duplicate key errors from races
  }
}

// GET /api/bookings/slots?date=YYYY-MM-DD
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!isValidDateString(date)) return res.status(400).json({ message: 'Query param "date" (YYYY-MM-DD) is required' });

    await ensureSlotsForDate(date);

    const slots = await Slot.find({ date }).sort({ time: 1 }).lean({ virtuals: true });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/bookings/slots/month?year=YYYY&month=MM (month is 1-12)
router.get('/slots/month', async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: 'Query param "year" must be a valid year (e.g. 2026)' });
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Query param "month" must be 1-12' });
    }

    const dim = daysInMonth(year, month);
    const dates = [];
    for (let day = 1; day <= dim; day++) {
      const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(iso);
    }

    // Ensure slots exist for each day so we can compute true availability.
    await Promise.all(dates.map((d) => ensureSlotsForDate(d)));

    const slots = await Slot.find({ date: { $in: dates } }).lean();
    const byDate = {};
    for (const d of dates) byDate[d] = { total: 0, available: 0, isFullyBooked: true };
    for (const s of slots) {
      const d = s.date;
      if (!byDate[d]) continue;
      byDate[d].total += 1;
      const isFull = s.bookedCount >= s.capacity;
      if (!isFull) {
        byDate[d].available += 1;
        byDate[d].isFullyBooked = false;
      }
    }

    // If for any reason a day has zero slots, mark it as unavailable.
    for (const d of dates) {
      if (byDate[d].total === 0) {
        byDate[d].available = 0;
        byDate[d].isFullyBooked = true;
      }
    }

    res.json({ year, month, dates: byDate });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// SSE stream: /api/bookings/slots/stream?date=YYYY-MM-DD
router.get('/slots/stream', async (req, res) => {
  const { date } = req.query;
  if (!isValidDateString(date)) return res.status(400).json({ message: 'Query param "date" (YYYY-MM-DD) is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const remove = addClient(res);

  try {
    await ensureSlotsForDate(date);
    const slots = await Slot.find({ date }).sort({ time: 1 }).lean({ virtuals: true });
    sendEvent(res, 'availability', { date, slots });
  } catch (e) {
    sendEvent(res, 'error', { message: 'Failed to load slots' });
  }

  const keepAlive = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (e) {
      // ignore
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    remove();
  });
});

// POST /api/bookings - create booking (date, time, serviceType, slotId?); return bookingRefId
router.post('/', requireAuth, async (req, res) => {
  try {
    const { slotId, date, time, serviceType } = req.body || {};
    if (!serviceType || !['driveway', 'walkway', 'full'].includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid "serviceType"' });
    }

    let slot;
    if (slotId) {
      slot = await Slot.findById(slotId);
    } else {
      if (!isValidDateString(date) || !isValidTimeString(time)) {
        return res.status(400).json({ message: '"date" (YYYY-MM-DD) and "time" (HH:mm) are required when slotId is not provided' });
      }
      await ensureSlotsForDate(date);
      slot = await Slot.findOne({ date, time });
    }

    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.bookedCount >= slot.capacity) return res.status(409).json({ message: 'Slot is fully booked' });

    const bookingRefId = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Make capacity enforcement atomic
    const updatedSlot = await Slot.findOneAndUpdate(
      { _id: slot._id, bookedCount: { $lt: slot.capacity } },
      { $inc: { bookedCount: 1 } },
      { new: true }
    );
    if (!updatedSlot) return res.status(409).json({ message: 'Slot is fully booked' });

    const booking = await Booking.create({
      userId: req.user.userId,
      slotId: updatedSlot._id,
      date: updatedSlot.date,
      time: updatedSlot.time,
      serviceType,
      bookingRefId
    });

    broadcastAvailabilityUpdate({ date: updatedSlot.date, slotId: String(updatedSlot._id) });

    res.status(201).json({
      message: 'Booking confirmed',
      bookingRefId: booking.bookingRefId,
      bookingId: booking._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
