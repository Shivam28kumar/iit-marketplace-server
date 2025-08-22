// server/controllers/adminController.js
import User from '../models/User.js';
import Product from '../models/Product.js';
import College from '../models/College.js';
import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js'; // <-- THIS IS THE CRITICAL FIX

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

// --- Product Management ---

// @desc    Admin deletes any product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // You may also want to delete the image from Cloudinary here in the future
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

// Export all functions so they can be used by the router.
export default {
    getAllUsers,
    deleteUser,
    deleteProduct,
    createCollege,
    deleteCollege,
    createBanner,
    deleteBanner,
};