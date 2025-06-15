const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, name, price, image, category, quantity } = req.body;

    // Validate if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is in stock
    if (product.countInStock < quantity) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new Cart({
        user: req.user._id,
        items: [{
          product: productId,
          name,
          price,
          image,
          category,
          quantity
        }],
        totalPrice: price * quantity
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        // Update quantity if product exists
        existingItem.quantity += quantity;
        existingItem.price = price; // Update price in case it changed
      } else {
        // Add new item if product doesn't exist
        cart.items.push({
          product: productId,
          name,
          price,
          image,
          category,
          quantity
        });
      }

      // Update total price
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
    }

    await cart.save();
    await cart.populate('items.product', 'name price image category');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("Product ID to remove:", productId);

    // Validate if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    console.log("Current cart items:", cart.items);

    // Use the model method to remove the item
    const updatedCart = await cart.removeItem(productId);
    
    if (!updatedCart) {
      return res.status(500).json({ message: 'Failed to update cart' });
    }

    // Get the updated cart with populated product details
    const populatedCart = await Cart.findById(updatedCart._id)
      .populate('items.product', 'name price image');

    console.log("Updated cart:", populatedCart);
    res.json(populatedCart);
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ 
      message: 'Error removing item from cart',
      error: error.message 
    });
  }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log('Updating quantity:', { productId, quantity });

    // Validate inputs
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item in cart
    const cartItem = cart.items.find(item => item.product.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if new quantity is available in stock
    if (product.countInStock < quantity) {
      return res.status(400).json({ 
        message: 'Not enough items in stock',
        available: product.countInStock,
        currentQuantity: cartItem.quantity
      });
    }

    // Update the quantity
    cartItem.quantity = quantity;

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    // Save the cart
    const updatedCart = await cart.save();

    // Get populated cart
    const populatedCart = await Cart.findById(updatedCart._id)
      .populate('items.product', 'name price image countInStock');

    console.log('Cart updated successfully:', {
      productId,
      oldQuantity: cartItem.quantity,
      newQuantity: quantity,
      totalPrice: populatedCart.totalPrice
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ 
      message: 'Error updating quantity',
      error: error.message 
    });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    console.log('request received in clear cart');
    const userId = req.user._id; // Get userId from authenticated user

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user' });
    }

    // Clear all items and reset total price
    cart.items = [];
    cart.totalPrice = 0;
    
    await cart.save();

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      message: 'Error clearing cart',
      error: error.message 
    });
  }
};
