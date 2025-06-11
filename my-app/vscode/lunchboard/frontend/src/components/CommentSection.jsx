// 디렉터리: frontend/src/components/CommentSection.jsx
import { useEffect, useState } from 'react';
import api from '../api';

export default function CommentSection({ recipeId }) {

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const token = localStorage.getItem('token');

  const COMMENTS_LIMIT = 15;

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${recipeId}?limit=${COMMENTS_LIMIT}`);

      // ✅ 방어 코드: res.data가 배열이 아닐 경우 빈 배열로 대체
      const data = Array.isArray(res.data) ? res.data : [];

      const enriched = data.map(c => ({
        ...c,
        updated: !!c.updated_at && c.updated_at !== c.created_at,
        isMine: localStorage.getItem('nickname') === c.nickname
      }));

      enriched.sort((a, b) => {
        if (b.likes === a.likes) {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return b.likes - a.likes;
      });

      setComments(enriched);
    } catch (err) {
      console.error('❌ 댓글 불러오기 실패:', err);
      setComments([]); // 에러 발생 시에도 UI 깨짐 방지
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (comments.length >= COMMENTS_LIMIT) return alert('댓글은 최대 15개까지만 작성할 수 있습니다.');
    try {
      await api.post('/comments', { recipeId, content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('❌ 댓글 작성 실패:', err);
    }
  };

  const deleteComment = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/comments/${id}`);
      fetchComments();
    } catch (err) {
      console.error('❌ 댓글 삭제 실패:', err);
    }
  };

  const startEdit = (id, content) => {
    setEditingId(id);
    setEditContent(content);
  };

  const submitEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      await api.put(`/comments/${id}`, { content: editContent });
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (err) {
      console.error('❌ 댓글 수정 실패:', err);
    }
  };

  const likeComment = async (id) => {
    try {
      await api.post(`/comments/${id}/like`);
      fetchComments();
    } catch (err) {
      console.error('❌ 좋아요 실패:', err);
    }
  };

  const bestCommentId = comments.length > 0 && comments[0].likes > 0 ? comments[0].id : null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold mb-3">💬 댓글 ({comments.length})</h2>

      {/* 작성 */}
      {token ? (
        comments.length < COMMENTS_LIMIT ? (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="댓글을 입력하세요"
            />
            <button onClick={submitComment} className="bg-blue-500 text-white px-4 py-2 rounded">
              작성
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">※ 댓글은 최대 15개까지만 작성할 수 있습니다.</p>
        )
      ) : (
        <p className="text-sm text-gray-500 mb-4">※ 로그인 후 댓글을 작성할 수 있습니다.</p>
      )}

      {/* 목록 */}
      <ul className="space-y-3">
        {comments.map((c, index) => (
          <li
            key={c.id}
            className={`p-3 rounded ${c.id === bestCommentId ? 'bg-yellow-100 border border-yellow-300 shadow-lg' : 'bg-gray-100'}`}
          >
            <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
              <span>
                👤 {c.nickname} {c.id === bestCommentId && <span className="ml-1">👑</span>}
              </span>
              <span>{new Date(c.created_at).toLocaleString()}</span>
            </div>

            {editingId === c.id ? (
              <div className="flex gap-2">
                <input
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="flex-1 border px-2 py-1 rounded"
                />
                <button onClick={() => submitEdit(c.id)} className="text-green-600">저장</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500">취소</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800">
                    {c.content} {c.updated && <span className="text-sm text-gray-500">(수정됨)</span>}
                  </p>
                  <button
                    onClick={() => likeComment(c.id)}
                    className="text-xs text-pink-500 hover:underline mt-1"
                  >
                    ❤️ 좋아요 {c.likes || 0}
                  </button>
                </div>
                {c.isMine && (
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => startEdit(c.id, c.content)} className="text-blue-600">수정</button>
                    <button onClick={() => deleteComment(c.id)} className="text-red-600">삭제</button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
