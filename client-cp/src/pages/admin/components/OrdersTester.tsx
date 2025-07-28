import React, { useState } from 'react';
import { ordersService, searchService, type CreateOrderRequest } from '../../../services';
import { useApiCall } from '../../../hooks/useApiCall';
import { ApiResult } from '../../../components/ApiResult';
import { UuidSearch } from '../../../components/UuidSearch';

export const OrdersTester: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [createData, setCreateData] = useState<CreateOrderRequest>({
    masterId: '',
    designId: '',
    appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    price: 2000
  });

  const [proposedTime, setProposedTime] = useState(
    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    status: '',
    role: 'client' as 'client' | 'master'
  });

  const apiCall = useApiCall();

  const handleCreateOrder = async () => {
    if (!createData.masterId.trim() || !createData.designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID мастера и дизайна')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => ordersService.createOrder({
        ...createData,
        appointmentTime: new Date(createData.appointmentTime).toISOString()
      }),
      'Заказ создан'
    );
  };

  const handleGetUserOrders = async () => {
    await apiCall.execute(
      () => ordersService.getUserOrders(searchParams),
      'Заказы пользователя получены'
    );
  };

  const handleGetOrderById = async () => {
    if (!orderId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID заказа')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => ordersService.getOrderById(orderId),
      'Заказ найден'
    );
  };

  const handleConfirmOrder = async () => {
    if (!orderId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID заказа')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => ordersService.confirmOrder(orderId),
      'Заказ подтвержден'
    );
  };

  const handleProposeTime = async () => {
    if (!orderId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID заказа')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => ordersService.proposeAlternativeTime(
        orderId,
        new Date(proposedTime).toISOString()
      ),
      'Время предложено'
    );
  };

  const handleDeclineOrder = async () => {
    if (!orderId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID заказа')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => ordersService.declineOrder(orderId, 'Причина отклонения'),
      'Заказ отклонен'
    );
  };

  const handleAcceptProposedTime = async () => {
    if (!orderId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID заказа')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => ordersService.acceptProposedTime(orderId),
      'Предложенное время принято'
    );
  };

  const handleGetActiveOrders = async () => {
    await apiCall.execute(
      () => ordersService.getActiveOrdersForMaster(),
      'Активные заказы мастера получены'
    );
  };

  const handleGetOrderHistory = async () => {
    await apiCall.execute(
      () => ordersService.getOrderHistoryForClient(),
      'История заказов клиента получена'
    );
  };

  const handleGetOrdersStats = async () => {
    await apiCall.execute(
      () => ordersService.getOrdersStats(),
      'Статистика заказов получена'
    );
  };

  // Функции для поиска
  const handleSearchDesigns = async (query: string) => {
    try {
      return await searchService.searchDesigns({ query });
    } catch (error) {
      console.error('Ошибка поиска дизайнов:', error);
      return [];
    }
  };

  const handleSearchMasters = async (query: string) => {
    try {
      return await searchService.searchMasters({ query });
    } catch (error) {
      console.error('Ошибка поиска мастеров:', error);
      return [];
    }
  };

  const handleSearchOrders = async (query: string) => {
    try {
      return await searchService.searchOrders({ query });
    } catch (error) {
      console.error('Ошибка поиска заказов:', error);
      return [];
    }
  };

  return (
    <div className="tester-section">
      <h2>📅 Тестирование заказов</h2>

      {/* Создание заказа */}
      <div className="form-section">
        <h3>Создание заказа</h3>
        
        <UuidSearch
          label="Мастер"
          placeholder="Введите имя или адрес мастера"
          value={createData.masterId}
          onChange={(value) => setCreateData({ ...createData, masterId: value })}
          onSearch={handleSearchMasters}
          required
        />
        
        <UuidSearch
          label="Дизайн"
          placeholder="Введите название или описание дизайна"
          value={createData.designId}
          onChange={(value) => setCreateData({ ...createData, designId: value })}
          onSearch={handleSearchDesigns}
          required
        />
        
        <div className="form-group">
          <label>Время записи:</label>
          <input
            type="datetime-local"
            value={createData.appointmentTime}
            onChange={(e) => setCreateData({ ...createData, appointmentTime: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Цена:</label>
          <input
            type="number"
            value={createData.price}
            onChange={(e) => setCreateData({ ...createData, price: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button onClick={handleCreateOrder} disabled={apiCall.loading}>
          {apiCall.loading ? 'Создание...' : 'Создать заказ'}
        </button>
      </div>

      {/* Поиск заказов */}
      <div className="form-section">
        <h3>Получение заказов</h3>
        <div className="form-group">
          <label>Страница:</label>
          <input
            type="number"
            value={searchParams.page}
            onChange={(e) => setSearchParams({ ...searchParams, page: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="form-group">
          <label>Лимит:</label>
          <input
            type="number"
            value={searchParams.limit}
            onChange={(e) => setSearchParams({ ...searchParams, limit: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div className="form-group">
          <label>Статус:</label>
          <select
            value={searchParams.status}
            onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
          >
            <option value="">Все</option>
            <option value="pending">Ожидает</option>
            <option value="confirmed">Подтвержден</option>
            <option value="declined">Отклонен</option>
            <option value="time_proposed">Предложено время</option>
            <option value="completed">Завершен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
        <div className="form-group">
          <label>Роль:</label>
          <select
            value={searchParams.role}
            onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value as 'client' | 'master' })}
          >
            <option value="client">Клиент</option>
            <option value="master">Мастер</option>
          </select>
        </div>
        <button onClick={handleGetUserOrders} disabled={apiCall.loading}>
          Получить заказы
        </button>
      </div>

      {/* Действия с заказом */}
      <div className="form-section">
        <h3>Действия с заказом</h3>
        
        <UuidSearch
          label="Поиск заказа"
          placeholder="Введите ID заказа"
          value={orderId}
          onChange={setOrderId}
          onSearch={handleSearchOrders}
        />
        
        <div className="actions-row">
          <button onClick={handleGetOrderById} disabled={apiCall.loading}>
            Получить по ID
          </button>
          <button onClick={handleConfirmOrder} disabled={apiCall.loading}>
            Подтвердить
          </button>
          <button onClick={handleDeclineOrder} disabled={apiCall.loading}>
            Отклонить
          </button>
        </div>
        
        <div className="form-group">
          <label>Предложить время:</label>
          <input
            type="datetime-local"
            value={proposedTime}
            onChange={(e) => setProposedTime(e.target.value)}
          />
          <button onClick={handleProposeTime} disabled={apiCall.loading}>
            Предложить время
          </button>
        </div>
        <button onClick={handleAcceptProposedTime} disabled={apiCall.loading}>
          Принять предложенное время
        </button>
      </div>

      {/* Дополнительные действия */}
      <div className="form-section">
        <h3>Дополнительные действия</h3>
        <div className="actions-row">
          <button onClick={handleGetActiveOrders} disabled={apiCall.loading}>
            Активные заказы мастера
          </button>
          <button onClick={handleGetOrderHistory} disabled={apiCall.loading}>
            История заказов клиента
          </button>
          <button onClick={handleGetOrdersStats} disabled={apiCall.loading}>
            Статистика заказов
          </button>
        </div>
      </div>

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