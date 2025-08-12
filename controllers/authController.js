const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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
transporter.verify(function (error, success) {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

  const isProd = process.env.NODE_ENV === 'production';

exports.register = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
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
     <div style="style="background: linear-gradient(to bottom right, #ecfdf5, #ffffff, #eff6ff); padding: 20px;"">
    <div style="max-width: 600px; margin: auto;  border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      
      <!-- Logo -->
      <div>
        <img src="${process.env.FRONTEND_URL}/static/media/logowithout%20name.fbdb73005c195970d570.png" alt="Shopinity" style="max-height: 60px;">
                <img src="${process.env.FRONTEND_URL}//static/media/namelogo.8b0ff2397e57c7ce515e.png" alt="Shopinity" style="max-height: 60px;">

      </div>

      <!-- Main Content -->
      <div style="padding: 30px; text-align: center;">
        <h1 style="color: #333;">Thank You for Choosing Shopinity</h1>
        <h2 style="color: #4F46E5;">Email Verification</h2>
        <p style="font-size: 16px; color: #555;">
          Please click the button below to verify your email address and activate your account.
        </p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; margin-top: 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Verify Email
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #888;">
          If you didn’t create an account with Shopinity, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 15px; background-color: #f1f1f1; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Shopinity. All rights reserved.
      </div>

    </div>
  </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with registration even if email fails
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token,
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
  const isProd = process.env.NODE_ENV === 'production';
  const { email, password } = req.body;
  console.log('NODE_ENV:', process.env.NODE_ENV, 'isProd:', isProd);
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({
    token,
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
