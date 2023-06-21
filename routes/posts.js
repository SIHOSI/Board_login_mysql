const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { Posts, Users } = require('../models');
const { Op } = require('sequelize');

// 전체 게시글 목록 조회 API
router.get('/posts', async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: ['postId', 'UserId', 'title', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'desc']],
    });
    res.status(200).json({ all_Posts: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  console.log(title, content);
  // console.log(res.locals);
  const { user } = res.locals;

  console.log(user);

  try {
    const post = await Posts.create({
      title,
      content,
      UserId: user.userId,
    });
    console.log(post);
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
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Posts.findOne({
      where: { postId },
    });

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
router.patch('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const { user } = res.locals;

  try {
    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Posts.findOne({
      where: { postId },
    });

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    if (user.userId !== post.UserId) {
      return res.status(400).json({ errorMessage: '권한이 없습니다.' });
    }

    // console.log(post);

    if (title) {
      await Posts.update(
        { title },
        {
          where: {
            [Op.and]: [{ postId: post.postId }, { UserId: user.userId }],
          },
        }
      );
    }
    if (content) {
      await Posts.update(
        { content },
        {
          where: {
            [Op.and]: [{ postId: post.postId }, { UserId: user.userId }],
          },
        }
      );
    }

    // 업데이트된 게시글을 다시 조회하여 반환, 그냥 post만 반환하면 작동은해도 오류코드가 나와서 넣어줌.
    const updatedPost = await Posts.findOne({
      where: { postId },
    });

    res.status(201).json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

// //게시글 삭제
// router.delete('/posts/:postId', async (req, res) => {
//   const { postId } = req.params;

//   try {
//     if (!mongoose.isValidObjectId(postId)) {
//       return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
//     }

//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
//     }

//     console.log(post);

//     await Post.deleteOne(post);

//     res.status(201).json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ errorMessage: '서버 에러' });
//   }
// });

module.exports = router;
