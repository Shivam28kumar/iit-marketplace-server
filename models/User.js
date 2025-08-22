// server/models/User.js
import mongoose from 'mongoose';

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
        required: function() { return this.role === 'user'; }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/@iit[a-z]+\.ac\.in$/, 'Please fill a valid IIT email address']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'company'],
        default: 'user'
    },
    
    // --- NEW FIELDS for Email Verification ---
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpires: {
        type: Date,
    },
    
    // --- NEW FIELDS for Password Reset ---
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },

}, { timestamps: true });

export default mongoose.model('User', UserSchema);