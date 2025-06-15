const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  addresses: [
    {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String
    }
  ],
  phone: { type: String },
  profilePicture: { type: String },
  lastLogin: { type: Date },
  lastLoginDevice: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
