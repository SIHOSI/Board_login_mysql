const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const Comment = require('../schemas/comment');
const Post = require('../schemas/post');

//댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { commentcontent } = req.body;
  const { postId } = req.params;
  // console.log(res.locals);
  const { user } = res.locals;

  try {
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    if (!commentcontent) {
      return res.status(400).json({ errorMessage: '댓글을 입력해주세요.' });
    }

    const comment = new Comment({
      nickname: post.nickname,
      nicknameId: post.nicknameId,
      posttitle: post.title,
      postId: post._id,
      commentcontent: commentcontent,
    });

    await comment.save();

    res.status(201).json({
      success: true,
      comment: comment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

//댓글 조회 게시글기준
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    const comments = await Comment.find({ postId }).sort({ syncTime: -1 });

    res.status(200).json({ all_Comments: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

//댓글 수정
router.patch(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { commentcontent } = req.body;
    const { user } = res.locals;

    try {
      if (!mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
      }

      if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ errorMessage: '유효하지 않은 댓글ID' });
      }

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(400).json({ errorMessage: '존재하지 않는 댓글ID' });
      }

      if (!commentcontent) {
        return res.status(400).json({ errorMessage: '댓글을 입력해주세요.' });
      } else {
        comment.commentcontent = commentcontent;
        comment.syncTime = Date.now();
        await comment.save();
      }

      res.status(201).json({
        success: true,
        comment: comment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: '서버 에러' });
    }
  }
);

//댓글 삭제
router.delete(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { commentcontent } = req.body;
    const { user } = res.locals;

    try {
      if (!mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
      }

      if (!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ errorMessage: '유효하지 않은 댓글ID' });
      }

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(400).json({ errorMessage: '존재하지 않는 댓글ID' });
      }

      if (!commentcontent) {
        return res.status(400).json({ errorMessage: '댓글을 입력해주세요.' });
      } else {
        await Comment.deleteOne(comment);
      }

      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: '서버 에러' });
    }
  }
);
module.exports = router;
