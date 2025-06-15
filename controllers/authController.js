const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Debug email configuration
console.log('Email Configuration:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD ? 'Password is set' : 'Password is missing',
  frontendUrl: process.env.FRONTEND_URL
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      verificationToken,
      verified: false
    });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: `"Ecommerce App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with registration even if email fails
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        verified: user.verified 
      },
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  res.json({ 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      verified: user.verified 
    } 
  });
};

exports.resetPassword = async (req, res) => {
  // Implement password reset logic (email token, etc.)
  res.json({ message: 'Password reset not implemented in this sample.' });
};
