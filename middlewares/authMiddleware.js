const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
exports.authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Admin resource. Access denied.' });
};
