const express = require('express');
const { addReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/:productId/reviews', authMiddleware, addReview);
router.get('/:productId/reviews', getReviews);
router.delete('/:productId/reviews/:reviewId', authMiddleware, deleteReview);

module.exports = router;
