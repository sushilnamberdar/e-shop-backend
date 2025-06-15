const express = require('express');
const { createCoupon, getCoupons, applyCoupon, deleteCoupon } = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createCoupon);
router.get('/', authMiddleware, adminMiddleware, getCoupons);
router.post('/apply', authMiddleware, applyCoupon);
router.delete('/:couponId', authMiddleware, adminMiddleware, deleteCoupon);

module.exports = router;