// server/controllers/orderController.js
const Order = require('../models/Order.js');
const { getReceiverSocketId, io } = require('../socket/socket.js');
const User = require('../models/User.js');
// 1. Place Order
const placeOrder = async (req, res) => {
    try {
        // Accept smallOrderFee from the body
        const { sellerId, items, itemTotal, platformFee, smallOrderFee, grandTotal, deliveryDetails } = req.body;
        const buyerId = req.user.id;

        // Security Check: Is Shop Open? (Keep this!)
        const shop = await User.findById(sellerId);
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        if (shop.shopDetails && !shop.shopDetails.isOpen) {
            return res.status(400).json({ message: "Shop is currently closed." });
        }

        const newOrder = new Order({
            buyer: buyerId,
            seller: sellerId,
            items,
            itemTotal,
            platformFee,
            smallOrderFee: smallOrderFee || 0, // Save the fee
            grandTotal,
            deliveryDetails
        });

        await newOrder.save();

        const shopSocketId = getReceiverSocketId(sellerId);
        if (shopSocketId) {
            io.to(shopSocketId).emit("newOrder", newOrder);
        }

        res.status(201).json(newOrder);
    } catch (err) {
        console.error("Order Error:", err);
        res.status(500).json({ message: err.message });
    }
};
// 2. Get Orders for Shop Owner (To be used in Shop Dashboard)
const getShopOrders = async (req, res) => {
    try {
        // Find orders where the logged-in user is the seller
        const orders = await Order.find({ seller: req.user.id })
            .populate('buyer', 'fullName phoneNumber') // Get buyer details
            .sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Update Status (Pending -> Ready -> Delivered)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        // Notify Buyer about the status update
        const buyerSocketId = getReceiverSocketId(order.buyer.toString());
        if (buyerSocketId) {
            io.to(buyerSocketId).emit("orderStatusUpdated", order);
        }
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- NEW FUNCTION ---
// 4. Get Orders for a specific User (Buyer)
// This is used for the "My Orders" page on the student side
const getUserOrders = async (req, res) => {
    try {
        // Find orders where 'buyer' matches the logged-in user
        const orders = await Order.find({ buyer: req.user.id })
            .populate('seller', 'fullName shopDetails') // Get shop name and details to display on the card
            .sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Export all 4 functions
module.exports = { 
    placeOrder, 
    getShopOrders, 
    updateOrderStatus, 
    getUserOrders // <-- Added here
};