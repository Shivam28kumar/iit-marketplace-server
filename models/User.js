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
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);