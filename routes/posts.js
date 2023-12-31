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
  // console.log(title, content);
  const { user } = res.locals;
  // console.log(res.locals);
  // [Object: null prototype] {
  //   user: Users {
  //     dataValues: {
  //       userId: 1,
  //       nickname: '1111',
  //       password: '2222',
  //       createdAt: 2023-06-21T08:46:12.000Z,
  //       updatedAt: 2023-06-21T08:46:12.000Z
  //     },
  //     _previousDataValues: {
  //       userId: 1,
  //       nickname: '1111',
  //       password: '2222',
  //       createdAt: 2023-06-21T08:46:12.000Z,
  //       updatedAt: 2023-06-21T08:46:12.000Z
  //     },
  //     uniqno: 1,
  //     _changed: Set(0) {},
  //     _options: {
  //       isNewRecord: false,
  //       _schema: null,
  //       _schemaDelimiter: '',
  //       raw: true,
  //       attributes: [Array]
  //     },
  //     isNewRecord: false
  //   }
  // }
  // console.log('---------------------');
  // console.log(user);
  // Users {
  //   dataValues: {
  //     userId: 1,
  //     nickname: '1111',
  //     password: '2222',
  //     createdAt: 2023-06-21T08:46:12.000Z,
  //     updatedAt: 2023-06-21T08:46:12.000Z
  //   },
  //   _previousDataValues: {
  //     userId: 1,
  //     nickname: '1111',
  //     password: '2222',
  //     createdAt: 2023-06-21T08:46:12.000Z,
  //     updatedAt: 2023-06-21T08:46:12.000Z
  //   },
  //   uniqno: 1,
  //   _changed: Set(0) {},
  //   _options: {
  //     isNewRecord: false,
  //     _schema: null,
  //     _schemaDelimiter: '',
  //     raw: true,
  //     attributes: [ 'userId', 'nickname', 'password', 'createdAt', 'updatedAt' ]
  //   },
  //   isNewRecord: false
  // }
  // console.log(res.locals.user);
  // Users {
  //   dataValues: {
  //     userId: 1,
  //     nickname: '1111',
  //     password: '2222',
  //     createdAt: 2023-06-21T08:46:12.000Z,
  //     updatedAt: 2023-06-21T08:46:12.000Z
  //   },
  //   _previousDataValues: {
  //     userId: 1,
  //     nickname: '1111',
  //     password: '2222',
  //     createdAt: 2023-06-21T08:46:12.000Z,
  //     updatedAt: 2023-06-21T08:46:12.000Z
  //   },
  //   uniqno: 1,
  //   _changed: Set(0) {},
  //   _options: {
  //     isNewRecord: false,
  //     _schema: null,
  //     _schemaDelimiter: '',
  //     raw: true,
  //     attributes: [ 'userId', 'nickname', 'password', 'createdAt', 'updatedAt' ]
  //   },
  //   isNewRecord: false
  // }

  try {
    const post = await Posts.create({
      title,
      content,
      UserId: user.userId,
    });
    // console.log(post);

    // const updatedPost = await Posts.findOne({ where: { postId } });

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

    const post = await Posts.findOne({ where: { postId } });

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

    const post = await Posts.findOne({ where: { postId } });

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

    // 업데이트된 게시글을 다시 조회하여 반환, 그냥 post로 반환하면 작동은 되는데 오류코드.
    const updatedPost = await Posts.findOne({ where: { postId } });

    res.status(201).json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

//게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { user } = res.locals;

  try {
    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ errorMessage: '유효하지 않은 게시글ID' });
    }

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(400).json({ errorMessage: '존재하지 않는 게시글ID' });
    }

    if (user.userId !== post.UserId) {
      return res.status(400).json({ errorMessage: '권한이 없습니다.' });
    }

    // console.log(post);

    await Posts.destroy({
      where: {
        [Op.and]: [{ postId: post.postId }, { UserId: post.UserId }],
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 에러' });
  }
});

module.exports = router;
