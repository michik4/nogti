import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminPanel } from './pages/admin/AdminPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './utils/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Защищенные маршруты для администраторов */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
        
        {/* Перенаправление на страницу входа для неизвестных маршрутов */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
