const express = require('express');
const router = express.Router();

const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { addClient, sendEvent, broadcastAvailabilityUpdate } = require('../services/slotEvents');

function serviceAmountForInvoice(serviceType) {
  switch (serviceType) {
    case 'driveway':
      return 80;
    case 'walkway':
      return 45;
    case 'full':
      return 120;
    default:
      return 80;
  }
}

async function ensureInvoiceForCompletedBooking(booking) {
  const existing = await Invoice.findOne({ bookingId: booking._id });
  if (existing) return existing;

  const invoiceRef = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  return Invoice.create({
    invoiceRef,
    userId: booking.userId,
    bookingId: booking._id,
    bookingRefId: booking.bookingRefId,
    amount: serviceAmountForInvoice(booking.serviceType),
    dueDate
  });
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

function serviceTypeLabel(serviceType) {
  switch (serviceType) {
    case 'driveway':
      return 'Driveway';
    case 'walkway':
      return 'Walkway';
    case 'full':
      return 'Full property';
    default:
      return serviceType;
  }
}

function statusToHuman(status) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'en_route':
      return 'En Route';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
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
      bookingRefId,
      status: 'pending'
    });

    broadcastAvailabilityUpdate({ date: updatedSlot.date, slotId: String(updatedSlot._id) });

    res.status(201).json({
      message: 'Booking request submitted — pending admin approval',
      bookingRefId: booking.bookingRefId,
      bookingId: booking._id,
      status: booking.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/bookings/my - owner view (status badge + placeholder notifications)
router.get('/my', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'email address.street address.city address.postalCode')
      .lean();

    res.json({ bookings: bookings.map((b) => ({ ...b, statusLabel: statusToHuman(b.status) })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/bookings/active - confirmed / in-progress jobs (admin only)
router.get('/active', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'en_route'] }
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'email address.street address.city address.postalCode')
      .lean();

    res.json({
      bookings: bookings.map((b) => ({
        ...b,
        statusLabel: statusToHuman(b.status),
        serviceLabel: serviceTypeLabel(b.serviceType)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/bookings/pending-requests — admin: bookings awaiting approval
router.get('/pending-requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'email phone address.street address.city address.postalCode')
      .lean();

    res.json({
      bookings: bookings.map((b) => ({
        ...b,
        statusLabel: statusToHuman(b.status),
        serviceLabel: serviceTypeLabel(b.serviceType)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/bookings/:id/cancel — owner cancels own pending booking (releases slot)
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    await Slot.findByIdAndUpdate(booking.slotId, { $inc: { bookedCount: -1 } });
    booking.status = 'cancelled';
    await booking.save();

    broadcastAvailabilityUpdate({ date: booking.date, slotId: String(booking.slotId) });

    res.json({ message: 'Booking cancelled', bookingId: booking._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/bookings/:id/approve — admin: pending → confirmed
router.post('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be approved' });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({ message: 'Booking approved', bookingId: booking._id, status: booking.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/bookings/:id/reject — admin: pending → cancelled, slot released
router.post('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be rejected' });
    }

    await Slot.findByIdAndUpdate(booking.slotId, { $inc: { bookedCount: -1 } });
    booking.status = 'cancelled';
    await booking.save();

    broadcastAvailabilityUpdate({ date: booking.date, slotId: String(booking.slotId) });

    res.json({ message: 'Booking rejected', bookingId: booking._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/bookings/:id/status — admin updates job status; completed creates an invoice
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status || !['pending', 'confirmed', 'en_route', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid "status"' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update fields based on status transition
    const now = new Date();
    booking.status = status;
    if (status === 'en_route') booking.enRouteAt = now;
    if (status === 'completed') booking.completedAt = now;

    // Placeholder notification record (no real email/SMS yet)
    if (status === 'en_route') {
      booking.notifications.push({
        type: 'en_route',
        sentAt: now,
        etaWindow: '15-30 mins',
        completionTime: null
      });
    }
    if (status === 'completed') {
      booking.notifications.push({
        type: 'job_complete',
        sentAt: now,
        etaWindow: null,
        completionTime: now
      });
    }

    await booking.save();

    if (status === 'completed') {
      await ensureInvoiceForCompletedBooking(booking);
    }

    res.json({ message: 'Status updated', bookingId: booking._id, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
