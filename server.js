// server/server.js

// --- MODULE IMPORTS using CommonJS 'require' ---
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { app, server } = require('./socket/socket.js'); // Import app and server

// Import all route handlers
const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const collegeRoutes = require('./routes/collegeRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const bannerRoutes = require('./routes/bannerRoutes.js');
const shopRoutes = require('./routes/shopRoutes.js'); 
const orderRoutes = require('./routes/orderRoutes.js'); 

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE (MUST COME BEFORE ROUTES) ---
// 1. JSON Parser: Allows server to read incoming data
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API ROUTES ---
// Mount the routes AFTER the middleware
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);

// --- START THE SERVER ---
server.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});