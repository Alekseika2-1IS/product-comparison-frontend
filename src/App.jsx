import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CatalogPage from './pages/CatalogPage';
import ComparePage from './pages/ComparePage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import ProductPage from './pages/ProductPage';
import AuthForm from './components/Auth/AuthForm';
import { getCurrentUser, logout, isAdmin } from './services/authService';

function AppContent() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuth(false);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <h1><Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Сравнение товаров</Link></h1>
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/">Каталог</Link>
          <Link to="/cart">Корзина</Link>
          {user && isAdmin() && <Link to="/admin">Админка</Link>}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Привет, {user.login}!</span>
              <button onClick={handleLogout} style={buttonStyle}>Выйти</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={buttonStyle}>Войти</button>
          )}
        </nav>
      </header>

      {showAuth && <AuthForm onSuccess={handleLoginSuccess} onClose={() => setShowAuth(false)} />}

      <Routes>
        <Route path="/" element={<CatalogPage user={user} />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/cart" element={<CartPage user={user} />} />
        <Route path="/admin" element={<AdminPage user={user} />} />
        <Route path="/product/:id" element={<ProductPage user={user} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const buttonStyle = {
  padding: '5px 10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default App;