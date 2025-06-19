const Product = require('../models/Product');

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true });
    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add featured product (Admin only)
exports.addFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isFeatured = true;
    await product.save();
    res.status(200).json({ message: 'Product marked as featured', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove featured product (Admin only)
exports.removeFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isFeatured = false;
    await product.save();
    res.json({ message: 'Product removed from featured', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all featured products (Admin only)
exports.getAllFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 });

    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching all featured products:', error);
    res.status(500).json({ 
      message: 'Error fetching featured products',
      error: error.message 
    });
  }
}; 