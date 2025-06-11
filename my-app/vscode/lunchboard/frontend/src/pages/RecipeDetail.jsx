// 📁 디렉터리: frontend/src/pages/RecipeDetail.jsx
import CommentSection from '../components/CommentSection';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [likes, setLikes] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get(`/recipes/${id}`)
      .then(res => {
        setData(res.data);
        setLikes(res.data.likes || 0);
      })
      .catch(err => console.error('상세 조회 실패', err));
  }, [id]);

  const toggleLike = async () => {
    if (!token) return alert('로그인이 필요합니다');
    try {
      const res = await api.post(`/recipes/${id}/like`);
      setLikes(res.data.likes);
    } catch (err) {
      console.error('좋아요 실패', err);
    }
  };

  if (!data) return <div className="p-10">불러오는 중...</div>;

  const { ingredients, calories, nutrition, tips, image_url, nickname, created_at } = data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8 space-y-6">
        {image_url && (
          <img
            src={`http://localhost:3001/uploads/${image_url}`}
            alt="식사 이미지"
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>👤 {nickname}</span>
          <span>{new Date(created_at).toLocaleDateString()}</span>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🍽️ 오늘의 식사</h2>
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {ingredients}
          </p>
        </div>

        {calories && (
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg">
            <h3 className="text-lg font-bold text-blue-700 mb-2">🧠 AI 분석 결과</h3>
            <p className="text-sm text-gray-700 mb-1"><strong>총 칼로리:</strong> {calories}</p>
            {nutrition && (
              <>
                <p className="text-sm text-gray-700"><strong>단백질:</strong> {nutrition.protein}</p>
                <p className="text-sm text-gray-700"><strong>탄수화물:</strong> {nutrition.carbs}</p>
                <p className="text-sm text-gray-700"><strong>지방:</strong> {nutrition.fat}</p>
              </>
            )}
            {tips && (
              <p className="text-sm text-green-600 mt-2"><strong>맛 팁:</strong> {tips}</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={toggleLike}
            className="text-red-500 hover:text-red-600 text-sm"
          >
            ❤️ 좋아요 {likes}
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/recipes/${id}/edit`)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
            >
              ✏️ 수정
            </button>
            <button
              onClick={async () => {
                if (window.confirm('정말 삭제하시겠습니까?')) {
                  await api.delete(`/recipes/${id}`);
                  alert('삭제되었습니다.');
                  navigate('/recipes');
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>

        <CommentSection recipeId={id} />
      </div>
    </div>
  );
}
