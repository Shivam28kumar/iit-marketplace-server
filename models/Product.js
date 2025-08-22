// server/models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productType: {
        type: String,
        enum: ['peer-to-peer', 'assured'],
        required: true,
    },
    college: {
        type: Schema.Types.ObjectId,
        ref: 'College',
    },
    visibleIn: [{
        type: Schema.Types.ObjectId,
        ref: 'College'
    }],
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);