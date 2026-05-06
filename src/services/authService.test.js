import { register, login, logout, getCurrentUser, isAdmin } from './authService';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('регистрация нового пользователя', () => {
    const result = register('testuser', '123456', 'test@example.com');
    expect(result.success).toBe(true);
    
    const users = JSON.parse(localStorage.getItem('app_users'));
    expect(users).toHaveLength(3);
    expect(users.find(u => u.login === 'testuser')).toBeDefined();
  });

  test('регистрация с существующим логином возвращает ошибку', () => {
    const result = register('admin', 'any', 'a@b.c');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Пользователь с таким логином уже существует');
  });

  test('вход с правильными данными', () => {
    const result = login('admin', 'admin');
    expect(result.success).toBe(true);
    expect(result.user.login).toBe('admin');
    expect(result.user.role).toBe('admin');
    expect(getCurrentUser()).toEqual(result.user);
  });

  test('вход с неверным паролем возвращает ошибку', () => {
    const result = login('admin', 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Неверный логин или пароль');
  });

  test('выход удаляет текущего пользователя', () => {
    login('user', 'user');
    expect(getCurrentUser()).not.toBeNull();
    logout();
    expect(getCurrentUser()).toBeNull();
  });

  test('isAdmin возвращает true только для admin', () => {
    login('admin', 'admin');
    expect(isAdmin()).toBe(true);
    logout();
    login('user', 'user');
    expect(isAdmin()).toBe(false);
  });
});