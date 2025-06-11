import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [editMap, setEditMap] = useState({});
  const nav = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      alert('회원 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateNickname = async (id) => {
    const nickname = editMap[id];
    try {
      await api.put(`/admin/users/${id}`, { nickname });
      alert('닉네임 수정 완료');
      fetchUsers();
    } catch {
      alert('수정 실패');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      alert('삭제 실패');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">👑 회원 관리</h1>
        <button
          onClick={() => nav('/recipes')}
          className="text-sm text-blue-600 border border-blue-400 px-3 py-1 rounded hover:bg-blue-50"
        >
          🏠 게시판으로 돌아가기
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">이메일</th>
            <th className="p-2 border">닉네임</th>
            <th className="p-2 border">가입일</th>
            <th className="p-2 border">수정</th>
            <th className="p-2 border">삭제</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="p-2 border text-center">{u.id}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">
                <input
                  className="border px-2 py-1 rounded"
                  value={editMap[u.id] ?? u.nickname}
                  onChange={e => setEditMap({ ...editMap, [u.id]: e.target.value })}
                />
              </td>
              <td className="p-2 border text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-2 border text-center">
                <button onClick={() => updateNickname(u.id)} className="text-blue-600 text-sm">수정</button>
              </td>
              <td className="p-2 border text-center">
                <button onClick={() => deleteUser(u.id)} className="text-red-600 text-sm">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
