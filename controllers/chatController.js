// server/controllers/chatController.js

// --- MODULE IMPORTS using CommonJS 'require' ---
const Conversation = require('../models/Conversation.js');
const Message = require('../models/Message.js');
const User = require('../models/User.js');
const { getReceiverSocketId, io } = require('../socket/socket.js');

// --- SEND a message (Role-aware) ---
// This function's internal logic is identical to your working version.
const sendMessage = async (req, res) => {
    try {
        const { message, productId } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id;
        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);
        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found." });
        }
        if (sender.role === 'user' && receiver.role === 'user') {
            if (sender.college.toString() !== receiver.college.toString()) {
                return res.status(403).json({ message: "Peer-to-peer chat is only allowed within the same college." });
            }
        }
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            product: productId,
        });
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                product: productId,
            });
        }
        const newMessage = new Message({ senderId, receiverId, message });
        if (newMessage) {
            conversation.messages.push(newMessage._id);
            conversation.lastMessage = newMessage._id;
        }
        await Promise.all([conversation.save(), newMessage.save()]);
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- GET messages for a conversation (Product-aware) ---
// This function's internal logic is identical to your working version.
const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user.id;
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required to get messages." });
        }
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
            product: productId
        }).populate("messages");
        if (!conversation) return res.status(200).json([]);
        res.status(200).json(conversation.messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- GET all of a user's conversations ---
// This function's internal logic is identical to your working version.
const getUserConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const conversations = await Conversation.find({ participants: loggedInUserId })
            .sort({ updatedAt: -1 })
            .populate({
                path: "participants",
                select: "fullName",
                match: { _id: { $ne: loggedInUserId } }
            })
            .populate('product', ['title', 'price', 'imageUrl'])
            .populate('lastMessage');
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getUserConversations controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- MARK messages as read ---
// This function's internal logic is identical to your working version.
const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        await Message.updateMany(
            { _id: { $in: conversation.messages }, receiverId: userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error in markAsRead controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- GET UNREAD MESSAGE COUNT ---
// This function's internal logic is identical to your working version.
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({ participants: userId });
        if (conversations.length === 0) return res.status(200).json({ unreadCount: 0 });
        const messageIds = conversations.flatMap(convo => convo.messages);
        const unreadCount = await Message.countDocuments({
            _id: { $in: messageIds },
            receiverId: userId,
            read: false,
        });
        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error("Error in getUnreadCount controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- MODULE EXPORTS using CommonJS 'module.exports' ---
// This makes all the functions available for the router to use.
module.exports = {
    sendMessage,
    getMessages,
    getUserConversations,
    markAsRead,
    getUnreadCount,
};