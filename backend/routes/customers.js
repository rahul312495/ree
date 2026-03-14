const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/customers
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await User.find(filter).select('-password').sort({ createdAt: -1 });
    // Attach order counts
    const withOrders = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ customer: c._id });
        const totalSpent = await Order.aggregate([
          { $match: { customer: c._id, status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        return {
          ...c.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );
    res.json(withOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
    res.json({ ...customer.toObject(), orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
