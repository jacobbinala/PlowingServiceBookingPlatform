const express = require('express');
const router = express.Router();

// TODO: Wire to Slot/Booking models
// GET /api/bookings/slots - get available slots (query: date or dateRange)
router.get('/slots', (req, res) => {
  res.json([]);
});

// POST /api/bookings - create booking (date, time, serviceType, userId, etc.); return bookingRefId
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Booking stub', bookingRefId: 'REF-STUB-001' });
});

module.exports = router;
