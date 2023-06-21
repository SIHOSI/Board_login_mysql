const express = require('express');
const router = express.Router();

const { Users } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');

// 회원가입 API
router.post('/auth/register', async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({
      errorMessage: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
    });
    return;
  }

  // nickname이 이미 사용 중인지 확인
  const existingUser = await Users.findOne({ where: { nickname } });
  if (existingUser) {
    res.status(400).json({
      errorMessage: '닉네임이 이미 사용 중입니다.',
    });
    return;
  }

  await Users.create({ nickname, password });

  res.status(201).json({ success: true });
});

module.exports = router;
