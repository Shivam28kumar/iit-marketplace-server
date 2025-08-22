// server/socket/socket.js
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import cors from 'cors'; // <-- STEP 1: Import cors

const app = express();
const server = http.createServer(app);

// --- THIS IS THE CRITICAL FIX ---
// We create a whitelist of URLs that are allowed to make requests.
// This includes your local dev environment and your live Vercel URL.
const whitelist = ['http://localhost:3000', 'https://iit-marketplace-client.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // If the origin of the request is in our whitelist (or if there's no origin, like with Postman), allow it.
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // Otherwise, block the request.
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// We apply the specific CORS options to the Socket.io server...
const io = new Server(server, {
    cors: corsOptions,
});

// ...AND we apply it to the Express app as well. This is crucial.
app.use(cors(corsOptions));
// --- END OF FIX ---


const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id);
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

// We export the app, io, and server to be used in server.js
export { app, io, server };