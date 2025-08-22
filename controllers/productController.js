// server/controllers/productController.js
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const cloudinary = require('../config/cloudinary.js');

// --- CREATE a new product (Role-aware) ---
const createProduct = async (req, res) => {
  const { title, description, price, category, visibleIn } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Please upload an image' });
  try {
    const user = await User.findById(req.user.id);
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'iit-marketplace' });
    const newProductData = { title, description, price, category, user: req.user.id, imageUrl: result.secure_url };
    if (user.role === 'company') {
      newProductData.productType = 'assured';
      newProductData.visibleIn = visibleIn ? JSON.parse(visibleIn) : [];
    } else {
      newProductData.productType = 'peer-to-peer';
      newProductData.college = user.college;
    }
    const newProduct = new Product(newProductData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Controller Error (createProduct):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- READ ALL products (Hybrid query logic) ---
const getAllProducts = async (req, res) => {
  try {
    const { search, category, college } = req.query;
    const filter = {};
    if (search) { filter.title = { $regex: search, $options: 'i' }; }
    if (category && category !== 'All') { filter.category = category; }
    if (college) {
      filter['$or'] = [
        { productType: 'peer-to-peer', college: college },
        { productType: 'assured', visibleIn: college }
      ];
    }
    const products = await Product.find(filter)
      .populate('user', ['fullName', 'role'])
      .sort({ productType: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Controller Error (getAllProducts):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- READ ONE product by its ID ---
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'fullName role college',
        populate: {
          path: 'college',
          select: 'name'
        }
      });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error("Controller Error (getProductById):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- READ ALL products by a specific User ID ---
const getProductsByUserId = async (req, res) => {
  try {
    const products = await Product.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Controller Error (getProductsByUserId):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- UPDATE a product ---
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });
    const updateData = { ...req.body };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'iit-marketplace' });
      updateData.imageUrl = result.secure_url;
      if (product.imageUrl) {
        const oldImagePublicId = product.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`iit-marketplace/${oldImagePublicId}`);
      }
    }
    product = await Product.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    res.json(product);
  } catch (err) {
    console.error("Controller Error (updateProduct):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- DELETE a product ---
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });
    if (product.imageUrl) {
      const publicId = product.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`iit-marketplace/${publicId}`);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (err) {
    console.error("Controller Error (deleteProduct):", err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByUserId,
  updateProduct,
  deleteProduct,
};