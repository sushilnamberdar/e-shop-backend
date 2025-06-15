const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(req.body.productId)) {
    user.wishlist.push(req.body.productId);
    await user.save();
  }
  res.json(user.wishlist);
};

exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
};

exports.removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(
    pid => pid.toString() !== req.params.productId
  );
  await user.save();
  res.json(user.wishlist);
};
