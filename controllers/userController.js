// server/controllers/userController.js
import User from '../models/User.js';

// Gets the private profile of the currently logged-in user.
// Gets the private profile of the currently logged-in user.
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not found in token' });
    }

    // --- THIS IS THE FIX ---
    // We find the user and now also .populate() their college details.
    // We also select the 'phoneNumber' to ensure it's included in the result.
    const user = await User.findById(req.user.id)
      .select('-password') // Still exclude the password
      .populate('college', 'name'); // Populate the 'name' field from the 'College' collection

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    res.json(user);
  } catch (err) {
    console.error("Controller Error (getMe):", err.message);
    res.status(500).send('Server Error');
  }
};
// Updates the profile of the currently logged-in user.
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

// Gets the public profile (just the name) of any user by their ID.
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
// Add this new function to server/controllers/userController.js
// @desc    Get a user's contact info (phone number)
// @route   GET /api/users/contact/:id
// @access  Private
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

        // --- NEW, SMARTER SECURITY CHECK ---
        // First, check if the target user is a 'company'.
        // If they are, any logged-in user is allowed to contact them.
        if (targetUser.role !== 'company') {
            // If the target is NOT a company, then they must be a regular user.
            // In this case, we enforce the strict same-college rule.
            if (loggedInUser.college.toString() !== targetUser.college.toString()) {
                return res.status(403).json({ message: "You can only view contact details of users from your own college." });
            }
        }
        // If the target user IS a company, the check is skipped, and the code proceeds.

        if (!targetUser.phoneNumber) {
            return res.status(404).json({ message: "Seller has not provided a phone number." });
        }

        res.json({ phoneNumber: targetUser.phoneNumber });

    } catch (error) {
        console.error("Controller Error (getUserContact):", error.message);
        res.status(500).send('Server Error');
    }
};


export default { getMe, updateMe, getUserProfile, getUserContact };