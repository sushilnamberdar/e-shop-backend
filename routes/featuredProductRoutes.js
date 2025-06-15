const express = require('express');
const router = express.Router();
const { 
  getFeaturedProducts,
  addFeaturedProduct,
  removeFeaturedProduct
} = require('../controllers/featuredProductController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Get featured products
router.get('/', getFeaturedProducts);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, addFeaturedProduct);
router.delete('/:productId', authMiddleware, adminMiddleware, removeFeaturedProduct);

module.exports = router; 