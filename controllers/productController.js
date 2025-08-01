// server/controllers/productController.js
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

exports.createProduct = async (req, res) => {
  const { title, description, price, category } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image' });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'iit-marketplace',
    });
    const newProduct = new Product({
      title,
      description,
      price,
      category,
      user: req.user.id,
      imageUrl: result.secure_url,
    });
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).send('Server Error');
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('user', ['fullName']).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', ['fullName']);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};