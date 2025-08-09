
const express = require('express');
// Admin routes

router.get('/admin/all', getAllOrders);
router.put('/admin/:id/status', updateOrderStatus);
