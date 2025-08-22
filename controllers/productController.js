import Product from '../models/Product.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// --- CREATE a new product (Now role-aware) ---
// This function now checks the role of the user posting the product.
const createProduct = async (req, res) => {
  // A 'company' user will send an array of college IDs in the 'visibleIn' field.
  const { title, description, price, category, visibleIn } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image' });
  }

  try {
    // We fetch the user to check their role.
    const user = await User.findById(req.user.id);
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'iit-marketplace' });

    const newProductData = {
      title, description, price, category,
      user: req.user.id,
      imageUrl: result.secure_url,
    };

    // --- LOGIC BRANCH ---
    // Here, we set the product details based on the user's role.
    if (user.role === 'company') {
      newProductData.productType = 'assured';
      // The frontend will send a JSON string of an array, so we must parse it.
      newProductData.visibleIn = visibleIn ? JSON.parse(visibleIn) : [];
    } else { // For regular 'user' or 'admin' roles
      newProductData.productType = 'peer-to-peer';
      newProductData.college = user.college; // A regular user's product is tied to their college.
    }

    const newProduct = new Product(newProductData);
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Controller Error (createProduct):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- READ ALL products (Now with hybrid query logic) ---
// This function is now much more powerful. It fetches products relevant to the user's college.
const getAllProducts = async (req, res) => {
  try {
    const { search, category, college } = req.query;
    const filter = {};

    if (search) { filter.title = { $regex: search, $options: 'i' }; }
    if (category && category !== 'All') { filter.category = category; }

    // --- NEW HYBRID QUERY ---
    if (college) {
      // If a college filter is provided (e.g., from a logged-in user),
      // we use MongoDB's '$or' operator to find products that match EITHER condition:
      filter['$or'] = [
        // Condition 1: Find a normal 'peer-to-peer' product posted from that college.
        { productType: 'peer-to-peer', college: college },
        // Condition 2: Find a premium 'assured' product where that college is in its visibility list.
        { productType: 'assured', visibleIn: college }
      ];
    }
    
    const products = await Product.find(filter)
      // We now also populate the user's role to show the "Assured" badge on the frontend.
      .populate('user', ['fullName', 'role'])
      // We sort to show 'assured' products first, then by the most recently created.
      .sort({ productType: -1, createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Controller Error (getAllProducts):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- READ ONE product by its ID ---
// No major changes needed here, but we'll populate more user info for safety.
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'fullName role college', // Select the fields we need
        populate: {
          path: 'college', // Also populate the college details for regular users
          select: 'name'
        }
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error("Controller Error (getProductById):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- READ ALL products by a specific User ID ---
// No changes are needed here. This works for all user roles.
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
// No major changes needed. The authorization logic already correctly checks the product owner.
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
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
// No major changes needed. The authorization logic is already correct.
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
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

// Export all the controller functions.
export default {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByUserId,
  updateProduct,
  deleteProduct,
};