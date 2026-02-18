const express = require('express');
const router = express.Router();

// TODO: Wire to User model and real logic
// POST /api/auth/register - email, password, phone, address; validate address; send Welcome email
router.post('/register', (req, res) => {
  res.status(201).json({ message: 'Registration stub', userId: 'stub-id' });
});

// POST /api/auth/login - email, password; return token/session; redirect to dashboard
router.post('/login', (req, res) => {
  res.json({ message: 'Login stub', token: 'stub-token' });
});

// POST /api/auth/forgot-password - email; send reset link
router.post('/forgot-password', (req, res) => {
  res.json({ message: 'Forgot password stub' });
});

module.exports = router;
