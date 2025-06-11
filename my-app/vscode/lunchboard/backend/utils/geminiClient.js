//backend/geminiClient.js
const axios = require('axios');
const apiKey = process.env.GEMINI_API_KEY;

async function analyzeNutrition(ingredients) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `오늘 먹은 식사: ${ingredients}

이 내용을 기반으로 아래 JSON 형식으로만 응답해주세요:
{"calories":"", "protein":"", "carbs":"", "fat":"", "tips":""}
- 단위는 g 또는 kcal로 간단하게 표시해주세요.
- 다른 설명 없이 JSON만 출력해주세요.`
          }
        ]
      }
    ]
  };

  try {
    const res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // ✅ 마크다운 백틱 제거
    const cleaned = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('❌ Gemini 응답 파싱 실패:', text);
      throw new Error('Gemini 응답이 JSON 형식이 아닙니다.');
    }

    if (!parsed.calories || !parsed.protein || !parsed.carbs || !parsed.fat) {
      throw new Error('AI 응답에 누락된 필드가 있습니다.');
    }

    return parsed;
  } catch (err) {
    console.error('❌ Gemini 호출 실패:', err.response?.data || err.message);
    throw new Error('Gemini 분석 중 오류 발생');
  }
}

module.exports = { analyzeNutrition };
