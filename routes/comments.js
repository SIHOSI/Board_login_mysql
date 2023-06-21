const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { Comments, Posts } = require('../models');
const { Op } = require('sequelize');

//댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { commentContent } = req.body;
  const { postId } = req.params;
  // console.log(res.locals);
  const { user } = res.locals;

  try {
    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    // if (user.userId !== post.UserId) {
    //   return res.status(400).json({ errorMessage: '권한이 없습니다.' });
    // }

    if (!commentContent) {
      return res.status(400).json({ errorMessage: '댓글을 입력해주세요.' });
    }

    const comment = await Comments.create({
      PostId: post.postId,
      UserId: user.userId,
      commentContent,
    });

    // const updatedComment = await Comments.findOne({
    //   where: {
    //     [Op.and]: [{ PostId: comment.PostId }, { UserId: comment.UserId }],
    //   },
    // });

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
    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    // if (user.userId !== post.UserId) {
    //   return res.status(400).json({ errorMessage: '권한이 없습니다.' });
    // }

    const comments = await Comments.findAll({
      where: {
        PostId: post.postId,
      },
      order: [['createdAt', 'desc']],
    });

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
    const { commentContent } = req.body;
    const { user } = res.locals;

    try {
      if (!Number.isInteger(Number(postId))) {
        return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
      }

      const post = await Posts.findOne({ where: { postId } });

      if (!post) {
        return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
      }

      const comment = await Comments.findOne({
        where: {
          [Op.and]: [
            { PostId: post.postId },
            { UserId: post.UserId },
            { commentId },
          ],
        },
      });

      if (!Number.isInteger(Number(commentId))) {
        return res.status(400).json({ errorMessage: '유효하지 않은 댓글ID' });
      }

      if (!comment) {
        return res.status(400).json({ errorMessage: '존재하지 않는 댓글ID' });
      }

      if (user.userId !== comment.UserId) {
        return res.status(400).json({ errorMessage: '권한이 없습니다.' });
      }

      if (!commentContent) {
        return res.status(400).json({ errorMessage: '댓글을 입력해주세요.' });
      } else {
        await Comments.update(
          { commentContent },
          {
            where: {
              [Op.and]: [
                { PostId: post.postId },
                { UserId: user.userId },
                { commentId },
              ],
            },
          }
        );
      }

      const updatedComment = await Comments.findOne({
        where: { PostId: postId, commentId: commentId },
      });

      res.status(201).json({
        success: true,
        comment: updatedComment,
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
    const { user } = res.locals;

    try {
      if (!Number.isInteger(Number(postId))) {
        return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
      }

      const post = await Posts.findOne({ where: { postId } });

      if (!post) {
        return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
      }

      const comment = await Comments.findOne({
        where: {
          [Op.and]: [
            { PostId: post.postId },
            { UserId: post.UserId },
            { commentId },
          ],
        },
      });

      if (!Number.isInteger(Number(commentId))) {
        return res.status(400).json({ errorMessage: '유효하지 않은 댓글ID' });
      }

      if (!comment) {
        return res.status(400).json({ errorMessage: '존재하지 않는 댓글ID' });
      }

      if (user.userId !== comment.UserId) {
        return res.status(400).json({ errorMessage: '권한이 없습니다.' });
      }

      await Comments.destroy({
        where: {
          [Op.and]: [
            { PostId: post.postId },
            { UserId: post.UserId },
            { commentId },
          ],
        },
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: '서버 에러' });
    }
  }
);

module.exports = router;
