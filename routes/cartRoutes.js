const express = require('express');
const { getCart, addToCart, removeFromCart, updateQuantity, clearCart } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get cart
router.get('/', getCart);

// Add to cart
router.post('/add', addToCart);

// Clear entire cart for a specific user
router.delete('/clear', clearCart);

// Update quantity
router.put('/:productId/quantity', updateQuantity);

// Remove from cart
router.delete('/:productId', removeFromCart);

module.exports = router;