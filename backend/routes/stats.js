const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');


// GET /api/stats/overview
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const [totalOrders, totalCustomers, totalProducts, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    res.json({
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingOrders,
      lowStockProducts,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/stats/revenue — last 7 days
router.get('/revenue', protect, adminOnly, async (req, res) => {
  try {
    const days = 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const agg = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      ]);

      result.push({
        date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: agg[0]?.revenue || 0,
        orders: agg[0]?.orders || 0,
      });
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/stats/categories
router.get('/categories', protect, adminOnly, async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          itemsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/stats/order-status
router.get('/order-status', protect, adminOnly, async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json(result.map((r) => ({
      status: r._id,
      count: r.count,
    })));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ⭐ NEW FEATURE — Top Selling Products
router.get('/top-products', protect, adminOnly, async (req, res) => {
  try {

    const result = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },

      { $unwind: '$items' },

      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },

      { $sort: { totalSold: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },

      { $unwind: '$productInfo' },

      {
        $project: {
          productName: '$productInfo.name',
          totalSold: 1,
          revenue: 1
        }
      }

    ]);

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;