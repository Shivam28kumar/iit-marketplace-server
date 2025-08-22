// server/server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express'; // This is still needed for express.json()
import { app, server } from './socket/socket.js'; // Import the pre-configured app and server

// Import all our route handlers
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';

// Initialize environment variables from the .env file
dotenv.config();

// Define the port, using the one Render provides in production, or 5000 for local development
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// Apply the JSON body parser to the 'app' instance we imported.
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// Mount all the route handlers to the Express app.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);

// --- Start the Server ---
// We use the 'server' instance (which includes both Express and Socket.io) to listen for connections.
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});