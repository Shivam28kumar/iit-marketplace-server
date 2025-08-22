// server/models/Conversation.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  // An array containing the IDs of the two users in the conversation
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  product: { // <-- ADD THIS
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
},
  // An array of all the messages in this conversation
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: [],
  }],
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);