// server/controllers/chatController.js
// server/controllers/chatController.js
const Conversation = require('../models/Conversation.js');
const Message = require('../models/Message.js');
const User = require('../models/User.js');
const { getReceiverSocketId, io } = require('../socket/socket.js');

// --- SEND a message ---
const sendMessage = async (req, res) => {
    try {
        const { message, productId } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id;

        if (!productId) return res.status(400).json({ message: "Product ID is required." });
        
        const [sender, receiver] = await Promise.all([ User.findById(senderId), User.findById(receiverId) ]);
        if (!sender || !receiver) return res.status(404).json({ message: "User not found." });
        if (sender.role === 'user' && receiver.role === 'user' && sender.college.toString() !== receiver.college.toString()) {
            return res.status(403).json({ message: "Peer-to-peer chat is only allowed within the same college." });
        }

        let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] }, product: productId });
        if (!conversation) {
            conversation = await Conversation.create({ participants: [senderId, receiverId], product: productId });
        }

        if (message && message.trim() !== '') {
            const newMessage = new Message({
                senderId,
                receiverId,
                message,
                conversationId: conversation._id, // <-- Add the conversationId
            });
            conversation.messages.push(newMessage._id);
            conversation.lastMessage = newMessage._id;
            await Promise.all([conversation.save(), newMessage.save()]);
            
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", { newMessage, conversationId: conversation._id });
            }
            res.status(201).json(newMessage);
        } else {
            res.status(201).json(null); // Respond gracefully if no message was sent
        }
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
// --- GET messages for a conversation ---
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
const getUserConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const conversations = await Conversation.find({ participants: loggedInUserId })
            .sort({ updatedAt: -1 })
            .populate({ path: "participants", select: "fullName", match: { _id: { $ne: loggedInUserId } } })
            .populate('product', ['title', 'price', 'imageUrl'])
            .populate('lastMessage');

        const conversationsWithUnreadCounts = await Promise.all(
            conversations.map(async (convo) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: convo._id,
                    receiverId: loggedInUserId,
                    read: false,
                });
                const convoObject = convo.toObject();
                convoObject.unreadCount = unreadCount;
                return convoObject;
            })
        );
        res.status(200).json(conversationsWithUnreadCounts);
    } catch (error) { /* ... error handling ... */ }
};

// --- MARK messages as read ---
// In server/controllers/chatController.js -> markAsRead
const markAsRead = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const loggedInUserId = req.user.id;
        
        await Message.updateMany(
            { senderId: otherUserId, receiverId: loggedInUserId, read: false },
            { $set: { read: true } }
        );
        
        const otherUserSocketId = getReceiverSocketId(otherUserId);
        if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("conversationsUpdated");
        }

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) { /* ... error handling ... */ }
};

// --- GET UNREAD MESSAGE COUNT ---
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

module.exports = {
    sendMessage,
    getMessages,
    getUserConversations,
    markAsRead,
    getUnreadCount,
};