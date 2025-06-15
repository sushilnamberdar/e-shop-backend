const Product = require('../models/Product');

exports.getInventory = async (req, res) => {
  const products = await Product.find({}, 'name countInStock');
  res.json(products);
};

exports.updateInventory = async (req, res) => {
  const { countInStock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    { countInStock },
    { new: true }
  );
  res.json(product);
};
