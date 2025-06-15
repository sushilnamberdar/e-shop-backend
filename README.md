# E-Commerce Backend API

A robust backend API for an e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 User Authentication & Authorization
- 👤 User Management
- 🛍️ Product Management
- 🛒 Shopping Cart
- 💳 Payment Integration
- 📦 Order Management
- ⭐ Featured Products
- 📊 Analytics
- 🔍 Search Functionality
- 📝 Reviews & Ratings

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Stripe** - Payment processing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sushilnamberdar/e-shop-backend.git
cd e-shop-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

### Featured Products
- `GET /api/featured` - Get featured products
- `POST /api/featured` - Add featured product (Admin)
- `DELETE /api/featured/:id` - Remove featured product (Admin)

### Analytics
- `GET /api/analytics/sales` - Get sales analytics
- `GET /api/analytics/products` - Get product analytics
- `GET /api/analytics/users` - Get user analytics

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middlewares/        # Custom middlewares
├── models/            # Database models
├── routes/            # API routes
├── utils/             # Utility functions
├── .env              # Environment variables
├── package.json      # Project dependencies
└── server.js         # Entry point
```

## Error Handling

The API uses a centralized error handling mechanism. All errors are returned in the following format:

```json
{
  "message": "Error message",
  "stack": "Error stack trace (in development)"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Sushil Namberdar - [@sushilnamberdar](https://github.com/sushilnamberdar)

Project Link: [https://github.com/sushilnamberdar/e-shop-backend](https://github.com/sushilnamberdar/e-shop-backend) 