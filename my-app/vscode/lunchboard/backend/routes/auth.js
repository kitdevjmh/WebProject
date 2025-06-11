const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');
const router  = express.Router();

// ✅ 회원가입
router.post('/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password || !nickname) return res.status(400).send('필수값 누락');

  try {
    const [dup] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (dup.length) return res.status(409).send('이미 가입된 이메일');

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
      [email, hash, nickname]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ✅ 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).send('이메일 또는 비밀번호 오류');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).send('이메일 또는 비밀번호 오류');

    // ✅ email 포함하여 JWT 발급 (★ 핵심 수정)
    const token = jwt.sign(
      {
        id: user.id,
        nickname: user.nickname,
        email: user.email // ← 반드시 포함
      },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );

    res.json({ token, nickname: user.nickname });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
