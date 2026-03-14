const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/products
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, available } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ⭐ NEW ROUTE — LOW STOCK PRODUCTS
// GET /api/products/low-stock
router.get('/low-stock', protect, adminOnly, async (req, res) => {
  try {

    const products = await Product.find({
      stock: { $lt: 10 }
    }).select('name stock price category');

    res.json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/products/:id
router.get('/:id', protect, async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST /api/products
router.post('/', protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.create(req.body);

    res.status(201).json(product);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// PUT /api/products/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    res.json(product);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted', id: req.params.id });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;