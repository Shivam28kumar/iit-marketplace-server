// server/models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // --- UPDATED: Added 'shop-item' to enum ---
    productType: {
        type: String,
        enum: ['peer-to-peer', 'assured', 'shop-item'],
        required: true,
    },
    
    // --- NEW: Stock status for shop items (Default true for everyone else) ---
    inStock: {
        type: Boolean,
        default: true
    },

    // Optional fields for different types
    college: {
        type: Schema.Types.ObjectId,
        ref: 'College',
    },
    visibleIn: [{
        type: Schema.Types.ObjectId,
        ref: 'College'
    }],

    // Standard fields
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    mrp: { type: Number }, 
    
    imageUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);