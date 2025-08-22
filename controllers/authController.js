// server/controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import generateOTP from '../utils/otpGenerator.js';

// --- Handles new user registration ---
const registerUser = async (req, res) => {
  const { fullName, password, collegeId, phoneNumber } = req.body;
  // --- FIX for Case-Sensitivity ---
  // We immediately convert the incoming email to lowercase and trim whitespace.
  // This normalized email will be used for all database queries and storage.
  const email = req.body.email.toLowerCase().trim();

  try {
    // We now search for the user using a case-insensitive regular expression.
    // This ensures that if 'TEST@EMAIL.COM' exists, we will find it even if the user types 'test@email.com'.
    let user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    if (user && user.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already registered and verified.' });
    }
    
    if (user && !user.isEmailVerified) {
        user.fullName = fullName;
        user.password = password;
        user.college = collegeId;
        user.phoneNumber = phoneNumber;
        user.email = email; // Ensure we save the consistent, lowercase version.
    } else {
      user = new User({
        fullName,
        email, // Save the normalized lowercase email.
        password,
        college: collegeId,
        phoneNumber,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    const otp = generateOTP();
    user.emailVerificationToken = otp;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    user.isEmailVerified = false;

    await user.save();

    const message = `Your OTP for email verification is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'IIT Marketplace - Verify Your Email',
            message,
        });
        res.status(201).json({
            success: true,
            message: `An OTP has been sent to ${user.email}. Please verify your email.`,
        });
    } catch (emailError) {
        return res.status(500).json({ message: "Error sending verification email." });
    }

  } catch (err) {
    console.error("Controller Error (registerUser):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- Handles OTP submission ---
const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    // --- FIX for Case-Sensitivity ---
    const email = req.body.email.toLowerCase().trim();

    try {
        // We use the normalized lowercase email to find the user.
        const user = await User.findOne({
            email,
            emailVerificationToken: otp,
            emailVerificationExpires: { $gt: Date.now() }
        }).populate('college', 'name');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                college: user.college ? { id: user.college._id, name: user.college.name } : null,
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ success: true, message: 'Email verified successfully!', token });
        });
        
    } catch (error) {
        console.error("Controller Error (verifyEmail):", error.message);
        res.status(500).send('Server Error');
    }
};

// --- Handles user login ---
const loginUser = async (req, res) => {
  // --- FIX for Case-Sensitivity ---
  const email = req.body.email.toLowerCase().trim();
  const { password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('college', 'name');
    
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(403).json({ message: 'Please verify your email before logging in.' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        college: user.college ? { id: user.college._id, name: user.college.name } : null,
      }
    };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error("Controller Error (loginUser):", err.message);
    res.status(500).send('Server Error');
  }
};

// --- FORGOT PASSWORD ---
const forgotPassword = async (req, res) => {
    // --- FIX for Case-Sensitivity ---
    const email = req.body.email.toLowerCase().trim();
    try {
        const user = await User.findOne({ email });
        // The rest of the logic is designed to be secure and not reveal if a user exists, which is good.
        if (!user || !user.isEmailVerified) {
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset OTP has been sent.' });
        }
        const otp = generateOTP();
        user.passwordResetToken = otp;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const message = `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
        await sendEmail({
            email: user.email,
            subject: 'IIT Marketplace - Password Reset',
            message,
        });
        res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    } catch (error) {
        res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }
};

// --- RESET PASSWORD ---
const resetPassword = async (req, res) => {
    const { otp, password } = req.body;
    // --- FIX for Case-Sensitivity ---
    const email = req.body.email.toLowerCase().trim();
    try {
        const user = await User.findOne({
            email,
            passwordResetToken: otp,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.' });
    } catch (error) {
        console.error("Controller Error (resetPassword):", error.message);
        res.status(500).send('Server Error');
    }
};

export default { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword };