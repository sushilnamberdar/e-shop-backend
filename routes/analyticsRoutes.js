const express = require('express');
const { getSalesAnalytics, getUserAnalytics, getProductAnalytics } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/sales', authMiddleware, adminMiddleware, getSalesAnalytics);
router.get('/users', authMiddleware, adminMiddleware, getUserAnalytics);
router.get('/products', authMiddleware, adminMiddleware, getProductAnalytics);

module.exports = router;
