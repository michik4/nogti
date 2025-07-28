# Защищенные маршруты в приложении

## Обзор

В приложении реализована система защиты маршрутов на основе аутентификации и ролей пользователей. Эта система позволяет ограничивать доступ к определенным страницам в зависимости от статуса авторизации и роли пользователя.

## Компонент ProtectedRoute

Компонент `ProtectedRoute` является основным инструментом для защиты маршрутов. Он проверяет, авторизован ли пользователь и имеет ли он необходимую роль для доступа к защищенному маршруту.

### Параметры

- `requiredRole` (опционально): Роль, необходимая для доступа к маршруту (например, 'admin', 'nailmaster', 'client')
- `redirectPath` (опционально, по умолчанию '/login'): Путь для перенаправления, если пользователь не авторизован или не имеет необходимой роли

### Пример использования

```tsx
<Routes>
  {/* Публичные маршруты */}
  <Route path="/login" element={<LoginPage />} />
  
  {/* Защищенные маршруты для администраторов */}
  <Route element={<ProtectedRoute requiredRole="admin" />}>
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/admin/users" element={<UsersManagement />} />
  </Route>
  
  {/* Защищенные маршруты для мастеров */}
  <Route element={<ProtectedRoute requiredRole="nailmaster" />}>
    <Route path="/master/profile" element={<MasterProfile />} />
    <Route path="/master/schedule" element={<MasterSchedule />} />
  </Route>
  
  {/* Защищенные маршруты для клиентов */}
  <Route element={<ProtectedRoute requiredRole="client" />}>
    <Route path="/client/profile" element={<ClientProfile />} />
    <Route path="/client/bookings" element={<ClientBookings />} />
  </Route>
  
  {/* Защищенные маршруты для любых авторизованных пользователей */}
  <Route element={<ProtectedRoute />}>
    <Route path="/catalog" element={<Catalog />} />
  </Route>
</Routes>
```

## Авторизация и проверка ролей

Система защиты маршрутов использует сервис `authService` для проверки авторизации и ролей:

- `authService.isAuthenticated()`: Проверяет наличие действительного токена аутентификации
- `authService.hasRole(role)`: Проверяет, имеет ли текущий пользователь указанную роль
- `authService.isAdmin()`: Проверяет, является ли пользователь администратором
- `authService.isMaster()`: Проверяет, является ли пользователь мастером
- `authService.isClient()`: Проверяет, является ли пользователь клиентом

## Перенаправление после авторизации

При перенаправлении на страницу входа, текущий путь сохраняется в состоянии навигации. Это позволяет после успешной авторизации вернуть пользователя на страницу, к которой он пытался получить доступ.

```tsx
// В компоненте LoginPage
const location = useLocation();
const navigate = useNavigate();
const from = location.state?.from?.pathname || '/';

// После успешной авторизации
navigate(from, { replace: true });
``` 