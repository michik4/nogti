import React, { useState } from 'react';
import { AuthTester } from './components/AuthTester';
import { DesignsTester } from './components/DesignsTester';
import { MastersTester } from './components/MastersTester';
import { OrdersTester } from './components/OrdersTester';
import './AdminPanel.css';

type TabType = 'auth' | 'designs' | 'masters' | 'orders';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('auth');

  const tabs = [
    { id: 'auth' as TabType, label: 'Авторизация', component: AuthTester },
    { id: 'designs' as TabType, label: 'Дизайны', component: DesignsTester },
    { id: 'masters' as TabType, label: 'Мастера', component: MastersTester },
    { id: 'orders' as TabType, label: 'Заказы', component: OrdersTester },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AuthTester;

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>🔧 Админ панель - Тестирование сервисов</h1>
        <p>Интерфейс для тестирования всех API сервисов</p>
      </header>

      <nav className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        <ActiveComponent />
      </main>
    </div>
  );
}; 