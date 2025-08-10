const express = require('express');
const { getCart, addToCart, removeFromCart, updateQuantity, clearCart } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();


// Get cart
router.get('/', authMiddleware, getCart);

// Add to cart
router.post('/add', authMiddleware, addToCart);

// Clear entire cart for a specific user
router.delete('/clear',  authMiddleware, clearCart);

// Update quantity
router.put('/:productId/quantity', authMiddleware, updateQuantity);

// Remove from cart
router.delete('/:productId', authMiddleware, removeFromCart);

module.exports = router;