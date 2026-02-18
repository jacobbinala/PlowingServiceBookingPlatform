const express = require('express');
const router = express.Router();

// Import route modules here
// Example: router.use('/bookings', require('./bookings'));

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
