const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getSalesAnalytics = async (req, res) => {
  const orders = await Order.find();
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  res.json({ totalSales, orderCount: orders.length });
};

exports.getUserAnalytics = async (req, res) => {
  const userCount = await User.countDocuments();
  res.json({ userCount });
};

exports.getProductAnalytics = async (req, res) => {
  const productCount = await Product.countDocuments();
  res.json({ productCount });
};
