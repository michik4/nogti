import React, { useState } from 'react';
import { authService, type LoginRequest, type RegisterRequest } from '../../../services';
import { useApiCall } from '../../../hooks/useApiCall';
import { ApiResult } from '../../../components/ApiResult';

export const AuthTester: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: 'test@example.com',
    password: 'password123'
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: 'newuser@example.com',
    username: 'newuser',
    password: 'password123',
    role: 'client',
    fullName: 'Тестовый Пользователь'
  });

  const [adminData, setAdminData] = useState({
    email: 'admin@example.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    fullName: 'Администратор',
    phone: '+7 (999) 123-45-67',
    adminSecret: 'nogotochki_admin_secret_2024'
  });

  const apiCall = useApiCall();

  const handleLogin = async () => {
    await apiCall.execute(
      () => authService.login(loginData),
      'Успешный вход'
    );
  };

  const handleRegister = async () => {
    await apiCall.execute(
      () => authService.register(registerData),
      'Успешная регистрация'
    );
  };

  const handleLogout = () => {
    authService.logout();
    apiCall.execute(
      () => Promise.resolve({ message: 'Выход выполнен' }),
      'Выход выполнен'
    );
  };

  const handleClearTokens = () => {
    authService.logout(); // Это очищает токены
    apiCall.execute(
      () => Promise.resolve({ message: 'Токены очищены' }),
      'Токены очищены'
    );
  };

  const handleRegisterAdmin = async () => {
    await apiCall.execute(
      () => authService.registerAdmin(adminData),
      'Администратор успешно зарегистрирован'
    );
  };

  const checkAuth = () => {
    const isAuth = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    apiCall.execute(
      () => Promise.resolve({ 
        isAuthenticated: isAuth, 
        user: user,
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      }),
      'Статус проверен'
    );
  };

  const currentUser = authService.getCurrentUser();

  return (
    <div className="tester-section">
      <h2>🔐 Тестирование авторизации</h2>

      {/* Статус авторизации */}
      <div className="status-section">
        <h3>Текущий статус</h3>
        <p>Авторизован: {authService.isAuthenticated() ? '✅ Да' : '❌ Нет'}</p>
        {currentUser && (
          <div>
            <p>Пользователь: {currentUser.email}</p>
            <p>Роль: {currentUser.role}</p>
          </div>
        )}
        <button onClick={checkAuth}>Проверить статус</button>
      </div>

      {/* Форма входа */}
      <div className="form-section">
        <h3>Вход в систему</h3>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={loginData.email || ''}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
        </div>
        <button onClick={handleLogin} disabled={apiCall.loading}>
          {apiCall.loading ? 'Загрузка...' : 'Войти'}
        </button>
      </div>

      {/* Форма регистрации */}
      <div className="form-section">
        <h3>Регистрация</h3>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={registerData.username}
            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Роль:</label>
          <select
            value={registerData.role}
            onChange={(e) => setRegisterData({ ...registerData, role: e.target.value as 'client' | 'nailmaster' | 'admin' })}
          >
            <option value="client">Клиент</option>
            <option value="nailmaster">Мастер</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <div className="form-group">
          <label>Полное имя:</label>
          <input
            type="text"
            value={registerData.fullName || ''}
            onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
          />
        </div>
        <button onClick={handleRegister} disabled={apiCall.loading}>
          {apiCall.loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </div>

      {/* Регистрация администратора */}
      <div className="form-section">
        <h3>🔑 Регистрация администратора</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Для регистрации администратора требуется секретный ключ
        </p>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={adminData.email}
            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={adminData.username}
            onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={adminData.password}
            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Полное имя:</label>
          <input
            type="text"
            value={adminData.fullName}
            onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Телефон:</label>
          <input
            type="tel"
            value={adminData.phone}
            onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Секретный ключ:</label>
          <input
            type="password"
            value={adminData.adminSecret}
            onChange={(e) => setAdminData({ ...adminData, adminSecret: e.target.value })}
            placeholder="nogotochki_admin_secret_2024"
          />
        </div>
        <button onClick={handleRegisterAdmin} disabled={apiCall.loading} className="success">
          {apiCall.loading ? 'Загрузка...' : 'Зарегистрировать администратора'}
        </button>
      </div>

      {/* Действия */}
      <div className="actions-section">
        <h3>Действия</h3>
        <div className="actions-row">
          <button onClick={handleLogout}>Выйти</button>
          <button onClick={handleClearTokens} className="secondary">Очистить токены</button>
        </div>
      </div>

      {/* Результат */}
      <ApiResult 
        loading={apiCall.loading}
        error={apiCall.error}
        success={apiCall.success}
        data={apiCall.data}
        onClear={apiCall.clearState}
      />
    </div>
  );
}; 