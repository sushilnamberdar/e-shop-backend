const express = require('express');
const { searchProducts, filterProducts } = require('../controllers/searchController');
const router = express.Router();

router.get('/search', searchProducts);
router.get('/filter', filterProducts);

module.exports = router;
