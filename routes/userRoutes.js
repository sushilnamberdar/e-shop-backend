const express = require('express');
const { getUser, updateProfile, changePassword, getAddresses, addAddress, deleteAddress } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/me', authMiddleware, getUser);
router.put('/me', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.delete('/addresses/:addressId', authMiddleware, deleteAddress);
router.get('/', (req, res) => res.send("Server is running"));

module.exports = router;