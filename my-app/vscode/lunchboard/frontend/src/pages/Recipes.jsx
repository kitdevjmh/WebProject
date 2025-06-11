// ✅ 디렉터리: frontend/src/pages/Recipes.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Recipes() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/recipes')
      .then(res => {
        // ✅ 방어처리: 응답 데이터가 배열인지 확인
        if (Array.isArray(res.data)) {
          setList(res.data);
        } else {
          console.error('응답 형식 오류: 배열 아님', res.data);
          setList([]);
        }
      })
      .catch(err => {
        console.error('레시피 불러오기 실패', err);
        setList([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🍽️ 식단 기록</h1>
          <button
            onClick={() => navigate('/recipes/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            ➕ 새 기록 쓰기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(list) && list.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
            >
              {recipe.image_url && (
                <img
                  src={`http://localhost:3001/uploads/${recipe.image_url}`}
                  alt="식단 사진"
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-gray-600 text-sm mb-2">
                🕒 {new Date(recipe.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-800 whitespace-pre-wrap mb-2">
                {recipe.ingredients.slice(0, 60)}...
              </p>
              {recipe.calories && (
                <div className="text-sm text-blue-700 bg-blue-50 rounded-md px-3 py-2 mb-2">
                  🔍 AI 요약: {recipe.calories} / 단백질 {recipe.nutrition?.protein || '-'}
                </div>
              )}
              <div className="flex gap-4 text-sm text-gray-500 mt-auto pt-2 border-t">
                <span>💬 {recipe.comments || 0}</span>
                <span>❤️ {recipe.likes || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
