// server/controllers/chatController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js'; // <-- THIS IS THE CRITICAL FIX: Import the User model
import { getReceiverSocketId, io } from '../socket/socket.js';

// --- SEND a message ---
// Creates a new message and a new conversation if one doesn't already exist for the product.
// Also performs a security check to ensure both users are from the same college.
// In server/controllers/chatController.js

// --- SEND a message (This is the updated, role-aware version) ---
const sendMessage = async (req, res) => {
    try {
        const { message, productId } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id;

        // Fetch both the sender and receiver to check their roles and colleges.
        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);

        // Basic check to ensure both users exist.
        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found." });
        }

        // --- NEW, SMARTER SECURITY CHECK ---
        // We only enforce the same-college rule IF AND ONLY IF both users are regular 'user' types.
        if (sender.role === 'user' && receiver.role === 'user') {
            // Since company users don't have a .college property, this check would crash.
            // By checking their roles first, we avoid that crash.
            if (sender.college.toString() !== receiver.college.toString()) {
                return res.status(403).json({ message: "Peer-to-peer chat is only allowed within the same college." });
            }
        }
        // If either the sender or receiver is a 'company' or 'admin', this check is skipped,
        // correctly allowing a regular user to contact a company, and vice-versa.

        // The rest of your logic for finding/creating a conversation is already perfect.
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
// --- GET messages for a conversation ---
/// In server/controllers/chatController.js

// --- GET messages for a conversation ---
const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params; // The ID of the other user in the chat
        const senderId = req.user.id; // The ID of the logged-in user

        // --- THIS IS THE FIX ---
        // We now correctly read the 'productId' from the URL query sent by the frontend.
        const { productId } = req.query;

        // If the frontend forgets to send the productId, we send a clear error.
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required to get messages." });
        }

        // Now, we find the conversation that matches BOTH the participants AND the product.
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
            product: productId
        }).populate("messages"); // And we populate the message details.

        // If no conversation is found for that specific product, return an empty array.
        if (!conversation) {
            return res.status(200).json([]);
        }

        res.status(200).json(conversation.messages);
    } catch (error) {
        // Correctly handle any other potential errors.
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
// --- GET all of a user's conversations ---
// In server/controllers/chatController.js
// In server/controllers/chatController.js

const getUserConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const conversations = await Conversation.find({ participants: loggedInUserId })
            .sort({ updatedAt: -1 }) // Sort by most recently updated conversation
            .populate({
                path: "participants",
                select: "fullName",
                match: { _id: { $ne: loggedInUserId } }
            })
            .populate('product', ['title', 'price', 'imageUrl'])
            // --- THIS IS THE FIX ---
            // We are now also populating the 'lastMessage' field.
            // This will replace the message's ObjectId with the full message document.
            .populate('lastMessage');

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getUserConversations controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- MARK messages as read ---
const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
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
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({ participants: userId });
        if (conversations.length === 0) {
            return res.status(200).json({ unreadCount: 0 });
        }
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

// We export all the functions we want to use in our routes.
export default {
    sendMessage,
    getMessages,
    getUserConversations,
    markAsRead,
    getUnreadCount,
};