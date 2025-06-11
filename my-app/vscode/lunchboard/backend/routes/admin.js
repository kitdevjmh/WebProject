const express = require('express');
const pool = require('../db');
const router = express.Router();

// ✅ 관리자 인증 미들웨어 (디버깅 포함)
router.use((req, res, next) => {
  const email = req.user?.email;
  console.log('🔐 관리자 접근 시도:', email);

  if (email === 'admin@9304') return next();

  return res.status(403).send('관리자 권한 없음');
});

// ✅ 모든 회원 조회
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, nickname, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ 회원 조회 실패:', err.message);
    res.status(500).send('회원 목록 조회 실패');
  }
});

// ✅ 닉네임 수정
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nickname } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE users SET nickname = ? WHERE id = ?`,
      [nickname, id]
    );
    if (result.affectedRows === 0) return res.status(404).send('유저 없음');
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ 닉네임 수정 실패:', err.message);
    res.status(500).send('닉네임 수정 실패');
  }
});

// ✅ 회원 삭제
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).send('유저 없음');
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ 회원 삭제 실패:', err.message);
    res.status(500).send('회원 삭제 실패');
  }
});

module.exports = router;
