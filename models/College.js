// server/models/College.js
import mongoose from 'mongoose';

// Defines the structure of a College document in the database.
const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model('College', CollegeSchema);