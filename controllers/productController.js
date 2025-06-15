const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    console.log('Fetching products with params:', req.query);
    
    // Check if we want all products without pagination
    if (req.query.all === 'true') {
      const products = await Product.find().sort('-createdAt');
      console.log('All products fetched successfully:', products.length);
      return res.json({ products });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';
    const category = req.query.category;
    const search = req.query.search;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    console.log('Applied filters:', filter);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    console.log('Total products found:', total);

    // Get products with pagination and sorting
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Products fetched successfully:', products.length);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product found:', product.name);
    res.json(product);
  } catch (error) {
    console.error('Error in getProduct:', error);
    res.status(500).json({ 
      message: 'Error fetching product',
      error: error.message 
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    console.log('Adding new product:', req.body);
    const { name, price, description } = req.body;
    let image = '';
    if (req.files && req.files.image) {
      image = `/uploads/${req.files.image.name}`;
      await req.files.image.mv(`uploads/${req.files.image.name}`);
    }
    const product = await Product.create({ name, price, description, image });
    console.log('Product created successfully:', product.name);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error in addProduct:', error);
    res.status(500).json({ 
      message: 'Error creating product',
      error: error.message 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      console.log('Product not found for update');
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product updated successfully:', product.name);
    res.json(product);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ 
      message: 'Error updating product',
      error: error.message 
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log('Product not found for deletion');
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product deleted successfully:', product.name);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ 
      message: 'Error deleting product',
      error: error.message 
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    console.log('Fetching product categories');
    const categories = await Product.distinct('category');
    console.log('Categories found:', categories);
    res.json(categories);
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ 
      message: 'Error fetching categories',
      error: error.message 
    });
  }
};