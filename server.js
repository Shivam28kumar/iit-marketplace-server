// server/server.js

// --- MODULE IMPORTS using CommonJS 'require' ---
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { app, server } = require('./socket/socket.js'); // Import the pre-configured app and server

// Import all our route handlers
const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const collegeRoutes = require('./routes/collegeRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const bannerRoutes = require('./routes/bannerRoutes.js');

// Initialize environment variables from the .env file
dotenv.config();

// Define the port, using the one Render provides in production, or 5000 for local development
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Apply the JSON body parser to the 'app' instance we imported.
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API ROUTES ---
// Mount all the route handlers to the Express app.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);

// --- START THE SERVER ---
// We use the 'server' instance (which includes both Express and Socket.io) to listen for connections.
server.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});