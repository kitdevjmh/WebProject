const express = require('express');
const pool = require('../db');

const router = express.Router();

// ✅ [POST] 댓글 작성
router.post('/', async (req, res) => {
  const { recipeId, content } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).send('로그인 필요');
  if (!recipeId || !content) return res.status(400).send('필수값 누락');

  try {
    await pool.query(
      `INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)`,
      [recipeId, userId, content]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send('댓글 저장 중 오류 발생');
  }
});

// ✅ [GET] 특정 레시피의 댓글 목록 (+ 좋아요 수 포함)
router.get('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.content, c.created_at, c.updated_at, u.nickname,
              (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at ASC`,
      [recipeId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('댓글 조회 중 오류 발생');
  }
});

// ✅ [PUT] 댓글 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;
  if (!userId || !content) return res.status(400).send('권한 또는 내용 오류');

  try {
    const [result] = await pool.query(
      `UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [content, id, userId]
    );
    if (result.affectedRows === 0) return res.status(403).send('수정 권한 없음');
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('댓글 수정 중 오류 발생');
  }
});

// ✅ [DELETE] 댓글 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).send('로그인 필요');

  try {
    const [result] = await pool.query(
      `DELETE FROM comments WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    if (result.affectedRows === 0) return res.status(403).send('삭제 권한 없음');
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('댓글 삭제 중 오류 발생');
  }
});

// ✅ [POST] 댓글 좋아요 토글
router.post('/:id/like', async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user?.id;
  if (!userId) return res.status(401).send('로그인 필요');

  try {
    const [[existing]] = await pool.query(
      `SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
      [commentId, userId]
    );

    if (existing) {
      // 이미 좋아요한 경우 → 좋아요 취소
      await pool.query(
        `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
        [commentId, userId]
      );
    } else {
      // 아직 안 눌렀으면 좋아요 추가
      await pool.query(
        `INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)`,
        [commentId, userId]
      );
    }

    // 최신 좋아요 수 반환
    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ?`,
      [commentId]
    );

    res.json({ likes: count });
  } catch (err) {
    console.error('❌ 좋아요 처리 실패:', err.message);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
