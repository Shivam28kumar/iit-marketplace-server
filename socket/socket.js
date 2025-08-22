// server/socket/socket.js
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId != "undefined") userSocketMap[userId] = socket.id;

    // Send online user list to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id);
        // Remove the user from the online users map
        if (userId) {
            delete userSocketMap[userId];
            // Send the updated list of online users to all clients
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

// We export the app, io, and server to be used in server.js
export { app, io, server };