import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('로그인이 필요합니다!');
    return <Navigate to="/login" />;
  }
  return children;
}
