import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');

  const onChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      alert('회원가입 성공! 로그인해주세요');
      nav('/login');
    } catch (err) {
      setError('회원가입 실패: 중복된 이메일일 수 있어요.');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-10 flex flex-col gap-4">
      <input type="email" name="email" placeholder="이메일" onChange={onChange} required />
      <input type="password" name="password" placeholder="비밀번호" onChange={onChange} required />
      <input type="text" name="nickname" placeholder="닉네임" onChange={onChange} required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-green-500 text-white p-2 rounded">회원가입</button>
    </form>
  );
}
