// server/socket/socket.js
const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Create the Express app instance.
const app = express();

// Create the base HTTP server from the Express app.
const server = http.createServer(app);

// --- Production-Ready CORS Configuration ---
const whitelist = ['http://localhost:3000', 'https://iit-marketplace-client-shivam28kumars-projects.vercel.app']; // Make sure your Vercel URL is correct
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Create the Socket.io server, configured with our CORS options.
const io = new Server(server, {
    cors: corsOptions,
});

// --- Apply CORS Middleware to the Express App ---
app.use(cors(corsOptions));

// --- Socket.io Logic ---
const userSocketMap = {}; // Maps a userId to their unique socketId

// Helper function to get a user's socket ID if they are online.
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

// This function runs every time a new client connects via WebSocket.
io.on('connection', (socket) => {
    console.log("A user connected via WebSocket:", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

// --- MODULE EXPORTS using CommonJS 'module.exports' ---
// We export the configured 'app', 'io', 'server', and the helper function.
module.exports = { app, io, server, getReceiverSocketId };