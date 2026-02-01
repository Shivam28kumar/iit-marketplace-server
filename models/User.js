// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        // College is only required for regular students
        required: function() { return this.role === 'user'; }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // --- THIS IS THE FIX ---
        // We use a custom validator instead of a simple 'match' regex.
        validate: {
            validator: function(v) {
                // If the user is a 'student', they MUST have an IIT email
                if (this.role === 'user') {
                    return /@iit[a-z]+\.ac\.in$/.test(v);
                }
                // For Shops, Admins, and Companies, ANY email is allowed
                return true; 
            },
            message: props => `${props.value} is not a valid IIT email address! Students must use their college ID.`
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'company', 'shop'],
        default: 'user'
    },
    
    // Fields for Shops
    shopDetails: {
        shopName: { type: String },
        description: { type: String },
        imageUrl: { type: String },
        isOpen: { type: Boolean, default: true },
        deliveryTime: { type: String, default: "15-20 mins" },
        minOrderValue: { type: Number, default: 0 } // Default is 0 (no limit)
    },

    // Verification fields
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Fields for Email Change
    newEmail: String,
    emailChangeToken: String,
    emailChangeExpires: Date,

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);