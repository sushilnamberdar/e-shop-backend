const express = require('express');
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getInventory);
router.put('/:productId', authMiddleware, adminMiddleware, updateInventory);

module.exports = router;
