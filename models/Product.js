// server/models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This links the product to the user who created it
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: { // <-- ADD THIS FIELD
  type: String,
  required: true,},
  // We will add image handling in a future step
  // imageUrl: {
  //   type: String,
  //   required: true,
  // }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);