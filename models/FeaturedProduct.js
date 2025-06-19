const mongoose = require('mongoose');

const featuredProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  originalPrice: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  reviews: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FeaturedProduct', featuredProductSchema); 