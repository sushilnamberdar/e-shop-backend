const FeaturedProduct = require('../models/FeaturedProduct');
const Product = require('../models/Product');

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await FeaturedProduct.find()
      .populate('product', 'name price description image category countInStock')
      .limit(4);

    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add featured product (Admin only)
exports.addFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already featured
    const existing = await FeaturedProduct.findOne({ product: productId });
    if (existing) {
      return res.status(400).json({ message: 'Product is already featured' });
    }

    // Check if we already have 4 featured products
    const count = await FeaturedProduct.countDocuments();
    if (count >= 4) {
      return res.status(400).json({ message: 'Maximum 4 featured products allowed' });
    }

    const featuredProduct = await FeaturedProduct.create({ product: productId });
    await featuredProduct.populate('product', 'name price description image category countInStock');

    res.status(201).json(featuredProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove featured product (Admin only)
exports.removeFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const featuredProduct = await FeaturedProduct.findOneAndDelete({ product: productId });
    if (!featuredProduct) {
      return res.status(404).json({ message: 'Featured product not found' });
    }

    res.json({ message: 'Product removed from featured' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all featured products (Admin only)
exports.getAllFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await FeaturedProduct.find()
      .populate('product', 'name price image description category')
      .sort({ position: 1 });

    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching all featured products:', error);
    res.status(500).json({ 
      message: 'Error fetching featured products',
      error: error.message 
    });
  }
}; 