const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  nickname: {
    type: String,
  },
  nicknameId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  syncTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Post', postSchema);
