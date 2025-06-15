const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, addToWishlist);
router.get('/', authMiddleware, getWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);

module.exports = router;