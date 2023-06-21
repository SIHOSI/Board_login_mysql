const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  nickname: {
    type: String,
  },
  nicknameId: {
    type: String,
  },
  posttitle: {
    type: String,
  },
  postId: {
    type: String,
  },
  commentcontent: {
    type: String,
  },
  syncTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Comment', commentSchema);
