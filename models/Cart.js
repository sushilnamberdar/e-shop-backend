const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  category: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, { _id: false }); // Disable _id for subdocuments

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a method to remove an item
cartSchema.methods.removeItem = async function(productId) {
  // Create a new array without the item to remove
  this.items = this.items.filter(item => item.product.toString() !== productId);
  
  // Recalculate total price
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Use findOneAndUpdate to ensure atomic operation
  const updatedCart = await this.constructor.findOneAndUpdate(
    { _id: this._id },
    { 
      $set: { 
        items: this.items,
        totalPrice: this.totalPrice
      }
    },
    { new: true }
  );
  
  return updatedCart;
};

// Add a method to update item quantity
cartSchema.methods.updateQuantity = async function(productId, newQuantity) {
  // Find the item
  const item = this.items.find(item => item.product.toString() === productId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }

  // Update quantity
  item.quantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
  
  // Recalculate total price
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Save changes
  const updatedCart = await this.constructor.findOneAndUpdate(
    { _id: this._id },
    { 
      $set: { 
        items: this.items,
        totalPrice: this.totalPrice
      }
    },
    { new: true }
  );
  
  return updatedCart;
};

module.exports = mongoose.model('Cart', cartSchema);
