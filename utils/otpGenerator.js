// server/utils/otpGenerator.js

// Generates a random 6-digit number as a string.
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

module.exports = generateOTP;