const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { Users } = require('../models');

// 로그인 API
router.post('/auth', async (req, res) => {
  const { nickname, password } = req.body;

  const user = await Users.findOne({ where: { nickname } });

  // NOTE: 인증 메세지는 자세히 설명하지 않는 것을 원칙으로 합니다.
  if (!user || password !== user.password) {
    res.status(400).json({
      errorMessage: '닉네임 또는 비밀번호가 틀렸습니다.',
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, 'custom-secret-key');
  //jwt.sign 함수를 이용해서 user.userId를 토큰의 페이로드에 저장
  res.cookie('Authorization', `Bearer ${token}`); // JWT를 Cookie로 할당합니다!
  res.status(200).json({ token }); // JWT를 Body로 할당합니다!
});

module.exports = router;
