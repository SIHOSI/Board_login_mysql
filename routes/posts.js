const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const Post = require('../schemas/post');

// 전체 게시글 목록 조회 API
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ syncTime: -1 });
    res.status(200).json({ all_Posts: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  // console.log(res.locals);
  const { user } = res.locals;

  // console.log(user);

  try {
    const post = new Post({
      title,
      content,
      nicknameId: user._id,
      nickname: user.nickname,
    });
    console.log(post);
    await post.save();
    res.status(201).json({
      success: true,
      post: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

//게시글 조회
router.get('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;

  try {
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    res.status(200).json({ Post: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

//게시글 수정
router.patch('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  try {
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    console.log(post);

    if (title) {
      post.title = title;
      post.syncTime = Date.now();
      await post.save();
    }
    if (content) {
      post.content = content;
      post.syncTime = Date.now();
      await post.save();
    }

    res.status(201).json({
      success: true,
      post: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

//게시글 삭제
router.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    console.log(post);

    await Post.deleteOne(post);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

module.exports = router;
