const express = require('express');
const router = require('express').Router ? require('express').Router() : express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { sendemail, verifyemail } = require('../controllers/EmailController.');



router.post('/send-verification/me',authMiddleware,sendemail);

router.get('/verify/:token', authMiddleware, verifyemail);

module.exports = router; 