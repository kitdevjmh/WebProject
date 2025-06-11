import { useNavigate, useLocation } from 'react-router-dom';

export default function NavBar() {
  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const nickname = localStorage.getItem('nickname');
  const isAdmin = nickname?.trim().toLowerCase() === 'admin';
  const isRecipeListPage = location.pathname === '/recipes';

  const logout = () => {
    localStorage.clear();
    nav('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => nav('/recipes')}
        >
          🍽️ Recipe Lunchboard
        </h1>

        <div className="flex gap-4 items-center">
          {token ? (
            <>
              <span className="text-sm font-semibold text-gray-700">
                👋{' '}
                {isAdmin ? (
                  <span className="text-yellow-500 font-extrabold animate-pulse">
                    ⭐ ADMIN ⭐
                  </span>
                ) : (
                  `${nickname}님`
                )}
              </span>

              {/* 🔐 어드민 전용 메뉴 */}
              {isAdmin && (
                <button
                  onClick={() => nav('/admin')}
                  className="text-sm text-purple-600 hover:underline"
                >
                  회원관리
                </button>
              )}

              {/* 🔁 일반 메뉴 */}
              {!isRecipeListPage && (
                <button
                  onClick={() => nav('/recipes/new')}
                  className="text-gray-700 hover:text-blue-600 text-sm"
                >
                  기록하기
                </button>
              )}

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => nav('/login')}
                className="text-gray-700 hover:text-blue-600 text-sm"
              >
                로그인
              </button>
              <button
                onClick={() => nav('/register')}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
