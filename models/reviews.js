const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchima = new mongoose.Schema({
  Product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Product',
    require:true
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    require:true
  },
  rating:{
    type:Number,
    required:true,
    min:1,
    max:5
  },
  Comment:{
    type:String,
    trim:true
  },
  comment:{
    type:String,
    trim:true
  },
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  images:[
    {type:String}
  ],
  isVerifiedBuyer:{
    type:Boolean,
    default:false
  }
  
  
},{timestamps:true});

module.exports = mongoose.model('Review',reviewSchima);