// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
    match: [/@iit[a-z]+\.ac\.in$/, 'Please fill a valid IIT email address'], // Optional: Regex for IIT emails
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('User', UserSchema);