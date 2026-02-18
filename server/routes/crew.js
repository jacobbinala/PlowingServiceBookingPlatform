const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const CrewMember = require('../models/CrewMember');

console.log('Crew route module loaded'); // Debug log

/**
 * Generate a random temporary password (8 characters: letters + numbers)
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET /api/crew - list crew (name, email, role, status)
router.get('/', async (req, res) => {
  console.log('GET /api/crew called'); // Debug log
  try {
    const crew = await CrewMember.find()
      .select('name email role active')
      .sort({ createdAt: -1 })
      .lean();
    const list = crew.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      role: c.role,
      active: c.active,
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load crew', error: err.message });
  }
});

// POST /api/crew - create crew member with temporary password
router.post('/', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }
    if (!['Driver', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Driver or Admin' });
    }

    const existing = await CrewMember.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A crew member with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const member = await CrewMember.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password: hashedPassword,
    });

    res.status(201).json({
      id: member._id.toString(),
      message: 'Crew member created successfully',
      tempPassword, // Return plain password for admin to share
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create crew member', error: err.message });
  }
});

// PATCH /api/crew/:id/deactivate - revoke access
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const member = await CrewMember.findByIdAndUpdate(
      req.params.id,
      { $set: { active: false } },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ message: 'Crew member not found' });
    }
    res.json({ message: 'Access revoked', id: member._id.toString() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate', error: err.message });
  }
});

module.exports = router;
