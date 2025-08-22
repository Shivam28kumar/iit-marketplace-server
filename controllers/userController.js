// server/controllers/userController.js

// --- MODULE IMPORTS using CommonJS 'require' ---
const User = require('../models/User.js');

// --- Gets the private profile of the currently logged-in user ---
// This function's internal logic is identical to your working version.
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not found in token' });
    }
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('college', 'name');
    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    res.json(user);
  } catch (err) {
    console.error("Controller Error (getMe):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- Updates the profile of the currently logged-in user ---
// This function's internal logic is identical to your working version.
const updateMe = async (req, res) => {
  const { fullName } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { fullName } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("Controller Error (updateMe):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- Gets the public profile of any user by their ID ---
// This function's internal logic is identical to your working version.
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("Controller Error (getUserProfile):", err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'User not found' });
    res.status(500).send('Server Error');
  }
};

// --- Gets contact info for a user with security checks ---
// This function's internal logic is identical to your working version.
const getUserContact = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const targetUserId = req.params.id;
        const [loggedInUser, targetUser] = await Promise.all([
            User.findById(loggedInUserId),
            User.findById(targetUserId).select('+phoneNumber')
        ]);
        if (!targetUser) {
            return res.status(404).json({ message: "Seller not found." });
        }
        if (targetUser.role !== 'company') {
            if (loggedInUser.college.toString() !== targetUser.college.toString()) {
                return res.status(403).json({ message: "You can only view contact details of users from your own college." });
            }
        }
        if (!targetUser.phoneNumber) {
            return res.status(404).json({ message: "Seller has not provided a phone number." });
        }
        res.json({ phoneNumber: targetUser.phoneNumber });
    } catch (error) {
        console.error("Controller Error (getUserContact):", error.message);
        res.status(500).send('Server Error');
    }
};

// --- MODULE EXPORTS using CommonJS 'module.exports' ---
// This makes all the functions available for the router to use.
module.exports = {
    getMe,
    updateMe,
    getUserProfile,
    getUserContact
};