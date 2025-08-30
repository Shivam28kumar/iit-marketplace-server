// server/socket/socket.js
const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// --- THIS IS THE FINAL, ROBUST CORS CONFIGURATION ---

// Define your specific allowed origins.
const allowedOrigins = [
    'http://localhost:3000',
    'https://iit-marketplace-client.vercel.app','https://collegecommercialcentre.in',         // The root domain
    'https://www.collegecommercialcentre.in'      // The www subdomain // VERIFY THIS IS YOUR EXACT VERCEL URL
];

// Configure the CORS options.
const corsOptions = {
  // The origin can be a function that dynamically checks the whitelist.
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  // This is important for some browsers.
  credentials: true,
};

// --- Apply the CORS middleware to the ENTIRE Express app FIRST ---
// This will handle the preflight requests for all your API routes.
app.use(cors(corsOptions));

// Now, create the Socket.io server and pass it the same origin list.
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    },
});
// --- END OF FIX ---


const userSocketMap = {};
const getReceiverSocketId = (receiverId) => { return userSocketMap[receiverId]; };

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

module.exports = { app, io, server, getReceiverSocketId };