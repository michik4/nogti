import React, { useState } from 'react';
import { designsService, searchService, type DesignSearchParams, type CreateDesignRequest } from '../../../services';
import { useApiCall } from '../../../hooks/useApiCall';
import { ApiResult } from '../../../components/ApiResult';
import { UuidSearch } from '../../../components/UuidSearch';

export const DesignsTester: React.FC = () => {
  const [searchParams, setSearchParams] = useState<DesignSearchParams>({
    page: 1,
    limit: 10,
    type: 'basic'
  });

  const [designId, setDesignId] = useState('');
  const [createData, setCreateData] = useState<CreateDesignRequest>({
    title: 'Тестовый дизайн',
    description: 'Описание тестового дизайна',
    imageUrl: 'https://example.com/image1.jpg',
    videoUrl: '',
    type: 'basic',
    tags: ['тест', 'дизайн'],
    color: 'розовый',
    estimatedPrice: 1500
  });

  const [adminParams, setAdminParams] = useState({
    page: 1,
    limit: 10,
    isModerated: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined
  });

  const apiCall = useApiCall();

  const handleGetDesigns = async () => {
    await apiCall.execute(
      () => designsService.getDesigns(searchParams),
      'Дизайны получены'
    );
  };

  const handleGetDesignById = async () => {
    if (!designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => designsService.getDesignById(designId),
      'Дизайн найден'
    );
  };

  const handleCreateDesign = async () => {
    await apiCall.execute(
      () => designsService.createDesign(createData),
      'Дизайн создан'
    );
  };

  const handleToggleLike = async () => {
    if (!designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна для лайка')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => designsService.toggleLike(designId),
      'Лайк обновлен'
    );
  };

  const handleGetMastersForDesign = async () => {
    if (!designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => designsService.getMastersForDesign(designId),
      'Мастера для дизайна получены'
    );
  };

  const handleGetPopularDesigns = async () => {
    await apiCall.execute(
      () => designsService.getPopularDesigns(5),
      'Популярные дизайны получены'
    );
  };

  const handleGetAllDesignsForAdmin = async () => {
    await apiCall.execute(
      () => designsService.getAllDesignsForAdmin(adminParams),
      'Все дизайны для админа получены'
    );
  };

  const handleModerateDesign = async (isModerated: boolean) => {
    if (!designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна для модерации')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => designsService.moderateDesign(designId, isModerated, true),
      isModerated ? 'Дизайн одобрен' : 'Дизайн отклонен'
    );
  };

  // Функция для поиска дизайнов
  const handleSearchDesigns = async (query: string) => {
    try {
      return await searchService.searchDesigns({ query });
    } catch (error) {
      console.error('Ошибка поиска дизайнов:', error);
      return [];
    }
  };

  return (
    <div className="tester-section">
      <h2>🎨 Тестирование дизайнов</h2>

      {/* Поиск дизайнов */}
      <div className="form-section">
        <h3>Получение списка дизайнов</h3>
        <div className="form-group">
          <label>Страница:</label>
          <input
            type="number"
            value={searchParams.page || 1}
            onChange={(e) => setSearchParams({ ...searchParams, page: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="form-group">
          <label>Лимит:</label>
          <input
            type="number"
            value={searchParams.limit || 10}
            onChange={(e) => setSearchParams({ ...searchParams, limit: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div className="form-group">
          <label>Тип:</label>
          <select
            value={searchParams.type || 'basic'}
            onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value as 'basic' | 'designer' })}
          >
            <option value="">Все</option>
            <option value="basic">Базовые</option>
            <option value="designer">Дизайнерские</option>
          </select>
        </div>
        <div className="form-group">
          <label>Источник:</label>
          <select
            value={searchParams.source || ''}
            onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value as 'admin' | 'client' | 'master' })}
          >
            <option value="">Все</option>
            <option value="admin">Администратор</option>
            <option value="client">Клиент</option>
            <option value="master">Мастер</option>
          </select>
        </div>
        <div className="form-group">
          <label>Цвет:</label>
          <input
            type="text"
            value={searchParams.color || ''}
            onChange={(e) => setSearchParams({ ...searchParams, color: e.target.value })}
            placeholder="Например: розовый"
          />
        </div>
        <div className="form-group">
          <label>Теги (через запятую):</label>
          <input
            type="text"
            value={searchParams.tags || ''}
            onChange={(e) => setSearchParams({ ...searchParams, tags: e.target.value })}
            placeholder="Например: френч,блестки"
          />
        </div>
        <button onClick={handleGetDesigns} disabled={apiCall.loading}>
          {apiCall.loading ? 'Загрузка...' : 'Получить дизайны'}
        </button>
      </div>

      {/* Действия с конкретным дизайном */}
      <div className="form-section">
        <h3>Действия с дизайном</h3>
        
        <UuidSearch
          label="Поиск дизайна"
          placeholder="Введите название или описание дизайна"
          value={designId}
          onChange={setDesignId}
          onSearch={handleSearchDesigns}
        />
        
        <div className="actions-row">
          <button onClick={handleGetDesignById} disabled={apiCall.loading}>
            Получить по ID
          </button>
          <button onClick={handleToggleLike} disabled={apiCall.loading}>
            Лайк/Анлайк
          </button>
          <button onClick={handleGetMastersForDesign} disabled={apiCall.loading}>
            Получить мастеров
          </button>
        </div>
      </div>

      {/* Создание дизайна */}
      <div className="form-section">
        <h3>Создание дизайна</h3>
        <div className="form-group">
          <label>Название:</label>
          <input
            type="text"
            value={createData.title}
            onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Описание:</label>
          <textarea
            value={createData.description}
            onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>URL изображения:</label>
          <input
            type="url"
            value={createData.imageUrl}
            onChange={(e) => setCreateData({ ...createData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="form-group">
          <label>URL видео (необязательно):</label>
          <input
            type="url"
            value={createData.videoUrl || ''}
            onChange={(e) => setCreateData({ ...createData, videoUrl: e.target.value })}
            placeholder="https://example.com/video.mp4"
          />
        </div>
        <div className="form-group">
          <label>Тип:</label>
          <select
            value={createData.type || 'basic'}
            onChange={(e) => setCreateData({ ...createData, type: e.target.value as 'basic' | 'designer' })}
          >
            <option value="basic">Базовый</option>
            <option value="designer">Дизайнерский</option>
          </select>
        </div>
        <div className="form-group">
          <label>Теги (через запятую):</label>
          <input
            type="text"
            value={createData.tags?.join(',') || ''}
            onChange={(e) => setCreateData({ ...createData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
            placeholder="Например: френч,блестки"
          />
        </div>
        <div className="form-group">
          <label>Цвет:</label>
          <input
            type="text"
            value={createData.color || ''}
            onChange={(e) => setCreateData({ ...createData, color: e.target.value })}
            placeholder="Например: розовый"
          />
        </div>
        <div className="form-group">
          <label>Примерная цена (руб):</label>
          <input
            type="number"
            value={createData.estimatedPrice || 0}
            onChange={(e) => setCreateData({ ...createData, estimatedPrice: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button onClick={handleCreateDesign} disabled={apiCall.loading}>
          {apiCall.loading ? 'Создание...' : 'Создать дизайн'}
        </button>
      </div>

      {/* Админ-функции */}
      <div className="form-section">
        <h3>Админ-функции</h3>
        <div className="form-group">
          <label>Страница:</label>
          <input
            type="number"
            value={adminParams.page}
            onChange={(e) => setAdminParams({ ...adminParams, page: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="form-group">
          <label>Лимит:</label>
          <input
            type="number"
            value={adminParams.limit}
            onChange={(e) => setAdminParams({ ...adminParams, limit: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div className="form-group">
          <label>Модерация:</label>
          <select
            value={adminParams.isModerated === undefined ? '' : adminParams.isModerated.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setAdminParams({ 
                ...adminParams, 
                isModerated: value === '' ? undefined : value === 'true' 
              });
            }}
          >
            <option value="">Все</option>
            <option value="true">Модерированные</option>
            <option value="false">Немодерированные</option>
          </select>
        </div>
        <div className="form-group">
          <label>Активность:</label>
          <select
            value={adminParams.isActive === undefined ? '' : adminParams.isActive.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setAdminParams({ 
                ...adminParams, 
                isActive: value === '' ? undefined : value === 'true' 
              });
            }}
          >
            <option value="">Все</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>
        </div>
        <div className="actions-row">
          <button onClick={handleGetAllDesignsForAdmin} disabled={apiCall.loading}>
            Все дизайны
          </button>
          <button onClick={handleGetPopularDesigns} disabled={apiCall.loading}>
            Популярные
          </button>
        </div>
        <div className="actions-row">
          <button onClick={() => handleModerateDesign(true)} disabled={apiCall.loading || !designId}>
            Одобрить дизайн
          </button>
          <button onClick={() => handleModerateDesign(false)} disabled={apiCall.loading || !designId}>
            Отклонить дизайн
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