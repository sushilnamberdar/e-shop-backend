const Product = require('../models/Product');

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.reviews.push({ user: req.user._id, rating, comment });
  product.averageRating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.json(product.reviews);
};

exports.getReviews = async (req, res) => {
  const product = await Product.findById(req.params.productId).populate('reviews.user', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product.reviews);
};

exports.deleteReview = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.reviews = product.reviews.filter(
    r => r._id.toString() !== req.params.reviewId && r.user.toString() === req.user._id.toString()
  );
  product.averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;
  await product.save();
  res.json(product.reviews);
};
