// server/models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- NEW: Delivery Details ---
  deliveryDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }, // e.g. "Aryabhatta Hostel, Room 304"
  },

  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }
  ],
  itemTotal: { type: Number, required: true },
  platformFee: { type: Number, default: 5 },
  smallOrderFee: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMode: { type: String, enum: ['COD', 'UPI'], default: 'COD' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);