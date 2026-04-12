// Ключи для localStorage
const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'current_user';

// Начальные данные (админ и тестовый пользователь)
const defaultUsers = [
  { id: 1, login: 'admin', password: 'admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, login: 'user', password: 'user', email: 'user@example.com', role: 'user' },
];

// Инициализация пользователей
const initUsers = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

// Регистрация нового пользователя
export const register = (login, password, email) => {
  initUsers();
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  if (users.find(u => u.login === login)) {
    return { success: false, error: 'Пользователь с таким логином уже существует' };
  }
  const newUser = {
    id: Date.now(),
    login,
    password,
    email,
    role: 'user',
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
};

// Вход в систему
export const login = (login, password) => {
  initUsers();
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  const user = users.find(u => u.login === login && u.password === password);
  if (user) {
    const { password: _, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  }
  return { success: false, error: 'Неверный логин или пароль' };
};

// Выход
export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Получить текущего пользователя
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Проверка роли
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};