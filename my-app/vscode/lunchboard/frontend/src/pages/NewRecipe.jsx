// 디렉터리: frontend/src/pages/NewRecipe.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewRecipe() {
  const nav = useNavigate();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    if (!text.trim()) return alert('식단 내용을 입력해주세요!');
    setLoading(true);

    const data = new FormData();
    data.append('title', ''); // 제목은 비워둠
    data.append('ingredients', text); // 자연어 문장을 그대로 분석
    data.append('steps', ''); // 조리법 없음
    if (image) data.append('image', image);

    try {
      await api.post('/recipes', data);
      alert('기록이 저장되었습니다!');
      nav('/recipes');
    } catch (err) {
      console.error(err);
      alert('업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-800">🍽️ 오늘 먹은 식사를 기록해보세요</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            어떤 걸 드셨나요?
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 resize-none"
            placeholder="예: 오늘은 계란프라이 2개, 밥 한 공기, 김치 조금을 먹었습니다."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사진 업로드 (선택)
          </label>
          <input type="file" onChange={e => setImage(e.target.files[0])} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold"
        >
          {loading ? '기록 중...' : '기록 저장하기'}
        </button>
      </form>
    </div>
  );
}
