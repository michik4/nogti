import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services';

interface ProtectedRouteProps {
  requiredRole?: string;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectPath = '/login',
}) => {
  const location = useLocation();
  
  // Проверяем, авторизован ли пользователь
  const isAuthenticated = authService.isAuthenticated();
  
  // Если требуется определенная роль, проверяем ее
  const hasRequiredRole = requiredRole 
    ? isAuthenticated && authService.hasRole(requiredRole)
    : true;
  
  // Если пользователь не авторизован или не имеет нужной роли, перенаправляем на страницу входа
  if (!isAuthenticated || !hasRequiredRole) {
    // Сохраняем текущий путь для возврата после авторизации
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Если все проверки пройдены, рендерим дочерние компоненты
  return <Outlet />;
}; 