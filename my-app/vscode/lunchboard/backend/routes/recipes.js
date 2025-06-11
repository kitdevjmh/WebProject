// ✅ 디렉터리: backend/routes/recipes.js
const express = require('express');
const multer = require('multer');
const pool = require('../db');
const { analyzeNutrition } = require('../utils/geminiClient');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ [POST] 레시피 작성
router.post('/', upload.single('image'), async (req, res) => {
  const { title, ingredients, steps } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).send('로그인 필요');

  try {
    const { calories, tips, ...nutrition } = await analyzeNutrition(ingredients);

    await pool.query(
      `INSERT INTO recipes 
        (user_id, title, ingredients, steps, image_url, calories, nutrition, tips)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        ingredients,
        steps,
        req.file?.filename || null,
        calories,
        JSON.stringify(nutrition),
        tips || '',
      ]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error('❌ 업로드 실패:', err.message);
    res.status(500).send('레시피 저장 중 오류 발생');
  }
});

// ✅ [GET] 전체 목록 (likes + comments 포함)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.title, r.ingredients, r.image_url, r.calories, r.nutrition, r.created_at,
        (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.id) AS likes,
        (SELECT COUNT(*) FROM comments WHERE recipe_id = r.id) AS comments
      FROM recipes r
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ✅ [GET] 상세 조회 (likes 포함)
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [[recipe]] = await pool.query(
      `SELECT r.*, u.nickname,
        (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.id) AS likes
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (!recipe) return res.status(404).send('레시피를 찾을 수 없습니다.');
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ✅ [PUT] 레시피 수정
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { title, ingredients, steps } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).send('로그인 필요');

  try {
    const [[original]] = await pool.query(
      'SELECT ingredients FROM recipes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!original) return res.status(404).send('레시피를 찾을 수 없습니다.');

    let calories = null, nutrition = null, tips = null;

    if (original.ingredients !== ingredients) {
      const aiResult = await analyzeNutrition(ingredients);
      calories = aiResult.calories;
      nutrition = JSON.stringify({
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
      });
      tips = aiResult.tips || '';
    }

    await pool.query(
      `UPDATE recipes SET title = ?, ingredients = ?, steps = ?${
        calories ? ', calories = ?, nutrition = ?, tips = ?' : ''
      } WHERE id = ? AND user_id = ?`,
      calories
        ? [title, ingredients, steps, calories, nutrition, tips, id, userId]
        : [title, ingredients, steps, id, userId]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ 레시피 수정 실패:', err.message);
    res.status(500).send('레시피 수정 중 오류 발생');
  }
});

// ✅ [DELETE] 레시피 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).send('로그인 필요');

  try {
    const [result] = await pool.query(
      `DELETE FROM recipes WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).send('삭제 권한이 없거나 존재하지 않는 레시피입니다.');
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('❌ 레시피 삭제 실패:', err.message);
    res.status(500).send('서버 오류로 삭제 실패');
  }
});

// ✅ [POST] 좋아요 토글
router.post('/:id/like', async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user?.id;

  if (!userId) return res.status(401).send('로그인 필요');

  try {
    const [[liked]] = await pool.query(
      `SELECT * FROM recipe_likes WHERE recipe_id = ? AND user_id = ?`,
      [recipeId, userId]
    );

    if (liked) {
      await pool.query(
        `DELETE FROM recipe_likes WHERE recipe_id = ? AND user_id = ?`,
        [recipeId, userId]
      );
    } else {
      await pool.query(
        `INSERT INTO recipe_likes (recipe_id, user_id) VALUES (?, ?)`,
        [recipeId, userId]
      );
    }

    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) AS count FROM recipe_likes WHERE recipe_id = ?`,
      [recipeId]
    );

    res.json({ likes: count });
  } catch (err) {
    console.error('좋아요 처리 실패:', err.message);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
