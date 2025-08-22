// server/server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { app, server } from './socket/socket.js'; // Import app and server from socket.js
import bannerRoutes from './routes/bannerRoutes.js';
import { app, server } from './socket/socket.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// We will create chatRoutes soon

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes); // <-- STEP 2: USE THE ROUTES


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/messages', messageRoutes); // We will add this

server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
