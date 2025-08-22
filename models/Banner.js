// server/models/Banner.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
    // The secure URL of the banner image hosted on Cloudinary
    imageUrl: {
        type: String,
        required: true,
    },
    // The URL this banner should link to (e.g., /product/123 or /search?category=Bicycles)
    linkUrl: {
        type: String,
        required: true,
    },
    // A simple flag to control if the banner is currently active and should be shown
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model('Banner', BannerSchema);