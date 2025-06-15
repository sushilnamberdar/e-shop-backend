const mongoose = require('mongoose');

const featuredProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FeaturedProduct', featuredProductSchema); 