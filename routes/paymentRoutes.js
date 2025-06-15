const express = require('express');
const { createStripePayment } = require('../controllers/paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/stripe', authMiddleware, createStripePayment);

module.exports = router;