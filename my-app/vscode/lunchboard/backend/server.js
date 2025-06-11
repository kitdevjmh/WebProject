require('dotenv').config();
console.log('✅ GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log("✅ typeof apiKey 전달값:", typeof process.env.GEMINI_API_KEY);

const express   = require('express');
const cors      = require('cors');
const jwt       = require('jsonwebtoken');

const auth      = require('./routes/auth');
const recipes   = require('./routes/recipes');
const comments  = require('./routes/comments');
const admin     = require('./routes/admin'); // ✅ 관리자 라우터

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ 인증 관련 라우터는 JWT 없이
app.use('/api/auth', auth);

// ✅ JWT 보호 미들웨어 (레시피 + 댓글 + 어드민)
app.use((req, res, next) => {
  if (
    req.path.startsWith('/api/recipes') ||
    req.path.startsWith('/api/comments') ||
    req.path.startsWith('/api/admin') // ✅ 반드시 포함!!
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('로그인 필요');
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      return res.status(401).send('토큰 오류');
    }
  } else {
    next();
  }
});

// ✅ JWT 통과한 후에 보호된 라우터 적용
app.use('/api/recipes', recipes);
app.use('/api/comments', comments);
app.use('/api/admin', admin); // ✅ 이 순서 중요함

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`✅ API listening on ${port}`));
