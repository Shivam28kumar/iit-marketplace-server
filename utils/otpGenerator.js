// server/utils/otpGenerator.js

const generateOTP = () => {
  // Generate a 6-digit random number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); // Convert it to a string
};

export default generateOTP;