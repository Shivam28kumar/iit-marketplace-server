// server/socket/socket.js
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import cors from 'cors';

// Create the Express app instance.
const app = express();

// Create the base HTTP server from the Express app.
const server = http.createServer(app);

// --- Production-Ready CORS Configuration ---
// This whitelist includes your local dev server and your live Vercel URL.
// IMPORTANT: Make sure 'https://iit-marketplace-client.vercel.app' is your actual Vercel URL.
const whitelist = ['http://localhost:3000', 'https://iit-marketplace-client.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Create the Socket.io server and attach it to the HTTP server, configured with our CORS options.
const io = new Server(server, {
    cors: corsOptions,
});

// --- Apply CORS Middleware to the Express App ---
// This is crucial for your regular API routes (POST, GET, etc.) to work from the live frontend.
app.use(cors(corsOptions));

// --- Socket.io Logic ---
const userSocketMap = {}; // Maps a userId to their unique socketId

// Helper function to get a user's socket ID if they are online.
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

// This function runs every time a new client connects via WebSocket.
io.on('connection', (socket) => {
    console.log("A user connected via WebSocket:", socket.id);
    
    // Get the userId sent from the frontend during connection.
    const userId = socket.handshake.query.userId;
    
    // If we have a userId, map it to the socket's unique ID.
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Broadcast the updated list of online user IDs to all connected clients.
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // This function runs when the client disconnects.
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Broadcast the new list
        }
    });
});

// We export the configured 'app', 'io', and 'server' to be used by our main server.js file.
export { app, io, server };