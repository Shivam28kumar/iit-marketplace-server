// server/controllers/shopController.js
const User = require('../models/User.js');
const Product = require('../models/Product.js');


// @route GET /api/shops/:id
const getShopDetails = async (req, res) => {
  try {
    const shop = await User.findById(req.params.id);
    
    if (!shop || shop.role !== 'shop') {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Return the specific shop fields needed for the menu page
    res.json({
        _id: shop._id,
        fullName: shop.fullName,
        email: shop.email, // Optional
        phoneNumber: shop.phoneNumber,
        shopDetails: shop.shopDetails // This contains isOpen, shopName, etc.
    });
  } catch (err) {
    console.error("Shop Controller Error (getShopDetails):", err.message);
    res.status(500).send('Server Error');
  }
};

// Update exports

// @desc    Get all registered shops (Users with role 'shop')
// @route   GET /api/shops
const getAllShops = async (req, res) => {
  try {
    // Find all users where role is 'shop'
    // We select specific fields including the new 'shopDetails'
    const shops = await User.find({ role: 'shop' })
      .select('fullName shopDetails email phoneNumber college');
      
    res.json(shops);
  } catch (err) {
    console.error("Shop Controller Error (getAllShops):", err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get the menu for a specific shop
// @route   GET /api/shops/:shopId/menu
const getShopMenu = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Find products belonging to this shop AND are marked as 'shop-item'
    const menuItems = await Product.find({ 
      user: shopId, 
      productType: 'shop-item' 
    }).sort({ category: 1 }); // Sort by category (e.g. Drinks, Snacks)

    res.json(menuItems);
  } catch (err) {
    console.error("Shop Controller Error (getShopMenu):", err.message);
    res.status(500).send('Server Error');
  }
};
// --- TOGGLE SHOP STATUS (Open/Close) ---
const toggleShopStatus = async (req, res) => {
  try {
    const shopId = req.user.id;
    const user = await User.findById(shopId);
    
    if (!user) return res.status(404).json({ message: "Shop not found" });

    // Toggle the boolean value
    user.shopDetails.isOpen = !user.shopDetails.isOpen;
    
    // We mark 'shopDetails' as modified because it's a nested object (Mongoose quirk)
    user.markModified('shopDetails');
    
    await user.save();
    res.json({ 
        isOpen: user.shopDetails.isOpen, 
        message: `Shop is now ${user.shopDetails.isOpen ? 'OPEN' : 'CLOSED'}` 
    });
  } catch (err) {
    console.error("Shop Status Error:", err);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION: Update Shop Settings ---
// @desc    Update shop details (Name, Desc, Time, MinOrder)
// @route   PUT /api/shops/settings
const updateShopSettings = async (req, res) => {
    try {
        const shopId = req.user.id;
        const { shopName, description, deliveryTime, minOrderValue, phoneNumber } = req.body;

        const user = await User.findById(shopId);
        if(!user) return res.status(404).json({ message: "Shop not found" });

        // Update fields
        user.shopDetails.shopName = shopName;
        user.shopDetails.description = description;
        user.shopDetails.deliveryTime = deliveryTime;
        user.shopDetails.minOrderValue = Number(minOrderValue); // Ensure it's a number
        
        // Update phone number (which sits on the root user object)
        if(phoneNumber) user.phoneNumber = phoneNumber;

        user.markModified('shopDetails');
        await user.save();

        res.json({ message: "Settings updated successfully", shopDetails: user.shopDetails });

    } catch (err) {
        console.error("Update Settings Error:", err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getAllShops, getShopMenu, toggleShopStatus, getShopDetails,updateShopSettings };