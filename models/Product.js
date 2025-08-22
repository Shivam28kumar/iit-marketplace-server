// server/models/Product.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // --- NEW: A field to distinguish between product types ---
    productType: {
        type: String,
        enum: ['peer-to-peer', 'assured'],
        required: true,
    },
    
    // --- MODIFIED: This field is now optional ---
    // It will be used for 'peer-to-peer' products to link them to a single user's college.
    college: {
        type: Schema.Types.ObjectId,
        ref: 'College',
    },
    
    // --- NEW: A field for 'Assured' products ---
    // This will hold an array of College IDs where the company wants the product to be visible.
    visibleIn: [{
        type: Schema.Types.ObjectId,
        ref: 'College'
    }],

    // --- All other fields remain the same ---
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);