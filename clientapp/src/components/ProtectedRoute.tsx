import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/user.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * Компонент для защиты маршрутов с проверкой аутентификации и ролей
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/auth'
}) => {
  const location = useLocation();

  // Проверяем аутентификацию
  if (!authService.isAuthenticated()) {
    // Сохраняем текущий путь для редиректа после входа
    const params = new URLSearchParams({
      message: 'Сначала войдите в систему',
    });
    return <Navigate to={`${redirectTo}?${params.toString()}`} state={{ from: location }} replace />;
  }

  // Проверяем роль, если требуется
  if (requiredRole && !authService.hasRole(requiredRole)) {
    // Перенаправляем на главную страницу, если нет нужной роли
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 