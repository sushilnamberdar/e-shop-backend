const express = require('express');
const router = require('express').Router ? require('express').Router() : express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// Send verification email for the logged-in user (uses token)
exports.sendemail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
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

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending verification email (me):', error);
    res.status(500).json({ message: 'Error sending verification email' });
  }
}

exports.verifyemail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
}