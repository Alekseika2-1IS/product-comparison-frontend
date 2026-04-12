import { useState } from 'react';
import { register, login } from '../../services/authService';

const AuthForm = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ login: '', password: '', email: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let result;
    if (isLogin) {
      result = login(formData.login, formData.password);
    } else {
      if (!formData.email) {
        setError('Почта обязательна');
        return;
      }
      result = register(formData.login, formData.password, formData.email);
    }
    if (result.success) {
      if (onSuccess) onSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={fieldGroup}>
            <label>Логин</label>
            <input type="text" name="login" value={formData.login} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={fieldGroup}>
            <label>Пароль</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
          </div>
          {!isLogin && (
            <div style={fieldGroup}>
              <label>Почта</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>
          )}
          <button type="submit" style={buttonStyle}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={switchButtonStyle}>
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
};

// Стили (можно вынести в CSS, для простоты оставим inline)
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
};
const modalStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px'
};
const fieldGroup = { marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '8px', marginTop: '4px' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const switchButtonStyle = { marginTop: '10px', background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer' };

export default AuthForm;