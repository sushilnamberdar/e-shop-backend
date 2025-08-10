require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const emailVerificationRoutes = require('./routes/emailVerificationRoutes');
const featuredProductRoutes = require('./routes/featuredProductRoutes');
const cookieParser = require('cookie-parser');
const { handleWebhook } = require('./controllers/paymentController');
const searchRoutes = require('./routes/searchRoutes');

// Raw body parser for Stripe webhooks
const rawBodyParser = (req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
};

const app = express();


const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
// CORS configuration
const corsOptions = {
  origin: true, // Your frontend URL
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(rawBodyParser);
app.use(express.json());

// Stripe webhook route - must be before other routes to use raw body
app.post('/api/payments/webhook', handleWebhook);
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/featured', featuredProductRoutes);
app.use('/api', searchRoutes);


const uri = process.env.MONGO_URI;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(process.env.PORT, () => console.log(` Database connected and Server running on port http://localhost:${process.env.PORT}`)))
  .catch(err => console.log(err));
