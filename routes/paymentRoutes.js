const express = require('express');
const router = express.Router();
const { 
  createPaymentIntent,
  handlePaymentSuccess
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Create payment intent (protected route)
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);

// Handle payment success (protected route)
router.post('/payment-success', authMiddleware, handlePaymentSuccess);

module.exports = router;