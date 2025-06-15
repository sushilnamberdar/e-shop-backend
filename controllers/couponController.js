const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res) => {
  const { code, discount, expiresAt } = req.body;
  const coupon = await Coupon.create({ code, discount, expiresAt });
  res.status(201).json(coupon);
};

exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
};

exports.applyCoupon = async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code, expiresAt: { $gt: new Date() } });
  if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });
  res.json({ discount: coupon.discount });
};

exports.deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.couponId);
  res.json({ message: 'Coupon deleted' });
};
