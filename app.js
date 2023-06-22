const express = require('express');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users.js');
const authRouter = require('./routes/auth.js');
const postRouter = require('./routes/posts.js');
const commentRouter = require('./routes/comments.js');
const path = require('path'); // url 뒤에 .html 오는게 거슬려서 추가 해봤습니다.

const app = express();
const port = 3000;

app.use(express.json()); // json형식의 요청을 파싱, json형식으로 이루어진 request Body를 받기 위해
app.use(express.urlencoded({ extended: false })); // html 에서 form 으로 제출된 request 받기 위해
app.use(cookieParser()); //req.cookie 객체를 통해 클라로부터 전송된 쿠키에 접근 하기 위해, 이를 이용해서 인증, 세션등
app.use(express.static('assets')); //정적파일 사용하기 위해, assets의 html, css, js, 이미지 등
app.get('/register', (req, res) => {
  const filePath = path.join(__dirname, 'assets', 'register.html');
  res.sendFile(filePath);
});
app.get('/board', (req, res) => {
  const filePath = path.join(__dirname, 'assets', 'board.html');
  res.sendFile(filePath);
});
app.use('/api', [usersRouter, authRouter, postRouter, commentRouter]);

app.listen(port, () => {
  console.log(port, '포트로 서버가 열림');
});
