const jwt = require('jsonwebtoken');
const { Users } = require('../models');

const authMiddleware = async (req, res, next) => {
  // console.log(req.cookies);
  const { Authorization } = req.cookies; // 로그인할때 쿠키에 저장한 authorization 확인.
  const [authType, authToken] = (Authorization ?? '').split(' ');
  // authorization 확인하고 토큰이 있는지 타입이 bearer이 맞는지
  // console.log(`authToken:${authToken}`);

  if (!authToken || authType !== 'Bearer') {
    return res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.',
    });
  }

  try {
    const decodedToken = jwt.verify(authToken, 'custom-secret-key');
    // console.log(decodedToken); //{ userId: 1, iat: 1687399315 }
    const user = await Users.findOne({
      where: { userId: decodedToken.userId },
    });
    if (!user) {
      return res.status(401).send({
        errorMessage: '유효한 사용자가 아닙니다.',
      });
    }
    res.locals.user = user;
    // res.locals는 express에서 제공되는 특별한 객체.
    // res.locals에 저장된 변수들은 요청됐을 때만 유효
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send({
      errorMessage: '로그인 에러.',
    });
  }
};

module.exports = authMiddleware;
