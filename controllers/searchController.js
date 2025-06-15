const Product = require('../models/Product');

exports.searchProducts = async (req, res) => {
  const { q } = req.query;
  const products = await Product.find({ name: { $regex: q, $options: 'i' } });
  res.json(products);
};

exports.filterProducts = async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
  const products = await Product.find(filter);
  res.json(products);
};
