const express = require('express');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users.js');
const authRouter = require('./routes/auth.js');
const postRouter = require('./routes/posts.js');
const commentRouter = require('./routes/comments.js');
const connect = require('./schemas');
const path = require('path');

const app = express();
const port = 3000;

connect(); // mongoose를 연결합니다.

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('assets'));
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
