const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/crew', require('./crew'));
router.use('/bookings', require('./bookings'));
router.use('/invoices', require('./invoices'));

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
