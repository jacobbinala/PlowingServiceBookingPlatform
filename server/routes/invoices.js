const express = require('express');
const router = express.Router();

const Invoice = require('../models/Invoice');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/invoices/my — property owner: list own invoices
router.get('/my', requireAuth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ invoices });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/invoices — admin: list invoices (optional ?status=unpaid|paid)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status === 'unpaid' || status === 'paid') filter.status = status;

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'email address.street address.city address.postalCode')
      .lean();

    res.json({ invoices });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/invoices/:id — single invoice (owner or admin)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('userId', 'email address.street address.city address.postalCode')
      .lean();

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = invoice.userId && invoice.userId._id.toString() === req.user.userId.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ invoice });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/invoices/:id — admin: mark paid (body: { status: "paid" })
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (status !== 'paid') {
      return res.status(400).json({ message: 'Only { status: "paid" } is supported' });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'paid') {
      return res.json({ message: 'Already paid', invoiceId: invoice._id });
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    res.json({ message: 'Invoice marked as paid', invoiceId: invoice._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
