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
const reviews = require('./models/reviews');
const reviewRoutes = require('./routes/reviewRoutes')

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

const allowedOrigins = [
  'https://shop.99flash.fun',
  'http://localhost:3000',
  // add other dev ports if needed, e.g. 'http://localhost:5173'
];
// CORS configuration
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow server-to-server or curl
    if (allowedOrigins.includes(origin)) {
      cb(null, origin);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(rawBodyParser);
app.use(express.json({ limit: '50mb' }));

// Stripe webhook route - must be before other routes to use raw body
app.post('/api/payments/webhook', handleWebhook);
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/featured', featuredProductRoutes);
app.use('/api', searchRoutes);

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>My E-commerce API</title>
      </head>
      <body style="font-family: Arial; text-align: center; padding: 20px;">
        <h1 style="color: teal;">Welcome to the E-commerce API</h1>
        <p>This is the home page of our API server.</p>
      </body>
    </html>
  `);
});


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(process.env.PORT, () => console.log(` Database connected and Server running on port http://localhost:${process.env.PORT}`)))
  .catch(err => console.log(err));
