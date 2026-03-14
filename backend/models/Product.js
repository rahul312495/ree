const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({

  name: { type: String, required: true, trim: true },

  category: {
    type: String,
    required: true,
    enum: [
      'Fruits',
      'Vegetables',
      'Dairy',
      'Bakery',
      'Meat & Seafood',
      'Beverages',
      'Snacks',
      'Pantry'
    ],
  },

  price: { type: Number, required: true, min: 0 },

  stock: { type: Number, required: true, default: 0, min: 0 },

  unit: {
    type: String,
    default: 'kg',
    enum: ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'dozen']
  },

  emoji: { type: String, default: '🛒' },

  description: { type: String },

  isAvailable: { type: Boolean, default: true },

  // ⭐ Average rating
  rating: {
    type: Number,
    default: 0
  },

  // ⭐ Number of reviews
  numReviews: {
    type: Number,
    default: 0
  },

  // ⭐ Reviews list
  reviews: [reviewSchema],

  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Product', productSchema);