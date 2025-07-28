import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services';
import { useApiCall } from '../../hooks/useApiCall';
import { ApiResult } from '../../components/ApiResult';
import './LoginPage.css';

type UserRole = 'client' | 'nailmaster' | 'admin';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    role: 'client' as UserRole,
    adminSecret: ''
  });
  const [showAdminFields, setShowAdminFields] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const apiCall = useApiCall();
  
  // Получаем предыдущий маршрут из состояния location
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setFormData(prev => ({ ...prev, role }));
    setShowAdminFields(role === 'admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // Логин
        await apiCall.execute(
          () => authService.login({
            email: formData.email,
            password: formData.password
          }),
          'Успешный вход'
        );
      } else {
        // Регистрация
        if (formData.role === 'admin') {
          // Регистрация администратора
          await apiCall.execute(
            () => authService.registerAdmin({
              email: formData.email,
              username: formData.username,
              password: formData.password,
              role: formData.role,
              fullName: formData.fullName,
              adminSecret: formData.adminSecret
            }),
            'Успешная регистрация администратора'
          );
        } else {
          // Обычная регистрация
          await apiCall.execute(
            () => authService.register({
              email: formData.email,
              username: formData.username,
              password: formData.password,
              role: formData.role,
              fullName: formData.fullName
            }),
            'Успешная регистрация'
          );
        }
      }

      // Если вход успешен, перенаправляем на предыдущую страницу или по роли
      if (authService.isAuthenticated()) {
        if (from !== '/') {
          // Если был указан предыдущий маршрут, возвращаемся на него
          navigate(from, { replace: true });
        } else if (authService.hasRole('admin')) {
          // Если пользователь админ и нет предыдущего маршрута, идем в админ-панель
          navigate('/admin', { replace: true });
        } else {
          // По умолчанию идем на главную
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>{isLogin ? 'Вход в систему' : 'Регистрация'}</h1>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Имя пользователя:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Полное имя:</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Роль:</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                >
                  <option value="client">Клиент</option>
                  <option value="nailmaster">Мастер маникюра</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              {showAdminFields && (
                <div className="form-group">
                  <label htmlFor="adminSecret">Секретный ключ администратора:</label>
                  <input
                    type="password"
                    id="adminSecret"
                    name="adminSecret"
                    value={formData.adminSecret}
                    onChange={handleInputChange}
                    required={showAdminFields}
                  />
                </div>
              )}
            </>
          )}
          
          <button type="submit" className="submit-button">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <ApiResult 
          loading={apiCall.loading} 
          error={apiCall.error} 
          success={apiCall.success} 
          data={apiCall.data} 
          onClear={apiCall.clearState}
        />
      </div>
    </div>
  );
}; 