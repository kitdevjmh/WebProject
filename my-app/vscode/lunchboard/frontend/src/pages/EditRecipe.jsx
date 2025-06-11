import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function EditRecipe() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '',
    ingredients: '',
    steps: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/recipes/${id}`)
      .then(res => {
        setForm({
          title: res.data.title,
          ingredients: res.data.ingredients,
          steps: res.data.steps
        });
      });
  }, [id]);

  const onChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/recipes/${id}`, form);
      alert('수정되었습니다.');
      nav(`/recipes/${id}`);
    } catch {
      alert('수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">레시피 수정</h1>
      <input name="title" value={form.title} onChange={onChange} className="border p-2 rounded" />
      <textarea name="ingredients" value={form.ingredients} onChange={onChange} className="border p-2 rounded h-24" />
      <textarea name="steps" value={form.steps} onChange={onChange} className="border p-2 rounded h-32" />
      <button disabled={loading} className="bg-yellow-500 text-white p-2 rounded">
        {loading ? '수정 중...' : '수정하기'}
      </button>
    </form>
  );
}