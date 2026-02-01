// server/controllers/adminController.js

// --- MODULE IMPORTS using CommonJS 'require' ---
const bcrypt = require('bcryptjs'); // Fixed: Changed from import to require
const User = require('../models/User.js');
const Product = require('../models/Product.js');
const College = require('../models/College.js');
const Banner = require('../models/Banner.js');
const cloudinary = require('../config/cloudinary.js');

// --- User Management ---

// @desc    Admin gets a list of all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('college', 'name');
        res.json(users);
    } catch (err) {
        console.error("Admin Controller Error (getAllUsers):", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin deletes a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });
    } catch (err) {
        console.error("Admin Controller Error (deleteUser):", err.message);
        res.status(500).send('Server Error');
    }
};

// --- Shop Management (NEW) ---

// @desc    Admin creates a new Shop Account
const createShop = async (req, res) => {
    const { fullName, email, password, shopName, description, deliveryTime, minOrderValue } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a Shop Logo' });
    }

    try {
        // 1. Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Upload Logo to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'iit-marketplace-shops',
        });

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User with 'shop' role
        const newShop = new User({
            fullName,
            email,
            password: hashedPassword,
            role: 'shop',
            isEmailVerified: true, // Auto-verify since Admin created it
            shopDetails: {
                shopName,
                description,
                deliveryTime: deliveryTime || "15-20 mins",
                imageUrl: result.secure_url,
                isOpen: true,
                minOrderValue: Number(minOrderValue) || 0
            }
        });

        await newShop.save();
        res.status(201).json(newShop);

    } catch (err) {
        console.error("Admin Controller Error (createShop):", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin deletes a shop
const deleteShop = async (req, res) => {
    try {
        const shop = await User.findById(req.params.id);
        if (!shop || shop.role !== 'shop') {
            return res.status(404).json({ message: 'Shop not found' });
        }
        
        // Optional: Delete shop's logo from Cloudinary here if needed
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shop removed successfully' });
    } catch (err) {
        console.error("Admin Controller Error (deleteShop):", err.message);
        res.status(500).send('Server Error');
    }
};

// --- Product Management ---

// @desc    Admin deletes any product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed by admin' });
    } catch (err) {
        console.error("Admin Controller Error (deleteProduct):", err.message);
        res.status(500).send('Server Error');
    }
};

// --- College Management ---

// @desc    Admin creates a new college
const createCollege = async (req, res) => {
    const { name } = req.body;
    try {
        let college = await College.findOne({ name });
        if (college) {
            return res.status(400).json({ message: 'College already exists' });
        }
        college = new College({ name });
        await college.save();
        res.status(201).json(college);
    } catch (err) {
        console.error("Admin Controller Error (createCollege):", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin deletes a college
const deleteCollege = async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }
        await College.findByIdAndDelete(req.params.id);
        res.json({ message: 'College removed successfully' });
    } catch (err) {
        console.error("Admin Controller Error (deleteCollege):", err.message);
        res.status(500).send('Server Error');
    }
};

// --- Banner Management ---

// @desc    Admin creates a new banner
const createBanner = async (req, res) => {
    const { linkUrl } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a banner image' });
    }
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'iit-marketplace-banners',
        });
        const newBanner = new Banner({
            imageUrl: result.secure_url,
            linkUrl,
        });
        const banner = await newBanner.save();
        res.status(201).json(banner);
    } catch (err) {
        console.error("Controller Error (createBanner):", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin deletes a banner
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        const publicId = banner.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`iit-marketplace-banners/${publicId}`);
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner removed successfully' });
    } catch (err) {
        console.error("Controller Error (deleteBanner):", err.message);
        res.status(500).send('Server Error');
    }
};

// --- MODULE EXPORTS using CommonJS 'module.exports' ---
// This makes all the functions available for the admin router to use.
module.exports = {
    getAllUsers,
    deleteUser,
    createShop,   // <-- Added
    deleteShop,   // <-- Added
    deleteProduct,
    createCollege,
    deleteCollege,
    createBanner,
    deleteBanner,
};