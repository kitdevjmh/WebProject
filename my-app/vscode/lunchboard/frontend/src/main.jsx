// 디렉터리: frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Recipes from './pages/Recipes';
import NewRecipe from './pages/NewRecipe';
import RecipeDetail from './pages/RecipeDetail';
import EditRecipe from './pages/EditRecipe';
import NavBar from './components/NavBar'; // ✅ 추가
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar /> {/* ✅ 상단 고정 내비게이션 바 삽입 */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 레시피 목록 */}
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          }
        />

        {/* 🔐 레시피 작성 */}
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <NewRecipe />
            </ProtectedRoute>
          }
        />

        {/* 🔐 레시피 상세 */}
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />

        {/* 🔐 레시피 수정 */}
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <EditRecipe />
            </ProtectedRoute>
          }
        />
      <Route
  path="/admin"
  element={
    <ProtectedRoute>
      {localStorage.getItem('nickname')?.trim().toLowerCase() === 'admin'
        ? <AdminPage />
        : <Login />}
    </ProtectedRoute>
  }
/>


        {/* 나머지 경로는 로그인으로 */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
