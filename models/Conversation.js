// server/models/Conversation.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: [],
  }],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);