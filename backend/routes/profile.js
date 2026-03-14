const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/profile — get current user's full profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile — update name, phone, email
router.put('/', protect, async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    // Check email uniqueness if changed
    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (exists) return res.status(400).json({ message: 'Email already in use by another account' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(phone !== undefined && { phone }), ...(email && { email }) },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/profile/password — change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── Address Management ──────────────────────────────────────────────────────

// GET /api/profile/addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/addresses — add a new address
router.post('/addresses', protect, async (req, res) => {
  try {
    const { label, line, city, state, pincode, isDefault } = req.body;
    if (!line) return res.status(400).json({ message: 'Address line is required' });

    const user = await User.findById(req.user._id);

    // If new address is default, unset all existing defaults
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    // If this is the first address, make it default
    const makeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({ label, line, city, state, pincode, isDefault: makeDefault });
    await user.save();

    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/profile/addresses/:addrId — update an address
router.put('/addresses/:addrId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const { label, line, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    if (label !== undefined) addr.label = label;
    if (line !== undefined) addr.line = line;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (pincode !== undefined) addr.pincode = pincode;
    if (isDefault !== undefined) addr.isDefault = isDefault;

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/profile/addresses/:addrId/default — set as default
router.put('/addresses/:addrId/default', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach(a => { a.isDefault = a._id.toString() === req.params.addrId; });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/profile/addresses/:addrId
router.delete('/addresses/:addrId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // If we deleted the default, assign default to first remaining
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
