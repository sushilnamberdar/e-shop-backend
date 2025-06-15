const express = require('express');
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus,
  cancelOrder 
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create new order
router.post('/', createOrder);

// Get user's orders
router.get('/my-orders', getUserOrders);

// Get single order by ID
router.get('/:id', getOrderById);

// Admin routes
router.get('/admin/all', getAllOrders);
router.put('/admin/:id/status', updateOrderStatus);

// Cancel order
router.put('/:id/cancel', cancelOrder);

module.exports = router;