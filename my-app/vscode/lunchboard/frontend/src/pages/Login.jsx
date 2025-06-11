import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);

      localStorage.setItem('token', data.token);
      localStorage.setItem('nickname', data.nickname);

      // ✅ 로그인 후: 관리자면 /admin, 아니면 /recipes로 이동
      if (data.nickname?.trim().toLowerCase() === 'admin') {
        nav('/admin');
      } else {
        nav('/recipes');
      }

    } catch {
      alert('로그인 실패: 이메일 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">🔐 로그인</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
