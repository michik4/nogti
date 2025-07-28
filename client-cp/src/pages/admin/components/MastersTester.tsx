import React, { useState } from 'react';
import { mastersService, searchService, type UpdateMasterProfileRequest, type NearbyMastersParams } from '../../../services';
import { useApiCall } from '../../../hooks/useApiCall';
import { ApiResult } from '../../../components/ApiResult';
import { UuidSearch } from '../../../components/UuidSearch';

export const MastersTester: React.FC = () => {
  const [designId, setDesignId] = useState('');
  const [masterId, setMasterId] = useState('');
  const [nearbyParams, setNearbyParams] = useState<NearbyMastersParams>({
    designId: '',
    lat: 55.7558,
    lng: 37.6176,
    radius: 10
  });

  const [profileData, setProfileData] = useState<UpdateMasterProfileRequest>({
    fullName: 'Тестовый Мастер',
    address: 'Москва, ул. Тестовая, 1',
    location: {
      lat: 55.7558,
      lng: 37.6176
    },
    description: 'Описание тестового мастера'
  });

  const apiCall = useApiCall();

  const handleAddCanDoDesign = async () => {
    if (!designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => mastersService.addCanDoDesign(designId),
      'Дизайн добавлен в "Я так могу"'
    );
  };

  const handleRemoveCanDoDesign = async () => {
    if (!designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => mastersService.removeCanDoDesign(designId),
      'Дизайн удален из "Я так могу"'
    );
  };

  const handleGetMasterDesigns = async () => {
    await apiCall.execute(
      () => mastersService.getMasterDesigns(),
      'Дизайны мастера получены'
    );
  };

  const handleGetMasterProfile = async () => {
    await apiCall.execute(
      () => mastersService.getMasterProfile(masterId || undefined),
      'Профиль мастера получен'
    );
  };

  const handleUpdateMasterProfile = async () => {
    await apiCall.execute(
      () => mastersService.updateMasterProfile(profileData),
      'Профиль обновлен'
    );
  };

  const handleFindNearbyMasters = async () => {
    if (!nearbyParams.designId.trim()) {
      await apiCall.execute(
        () => Promise.reject(new Error('Введите ID дизайна для поиска мастеров')),
        ''
      );
      return;
    }

    await apiCall.execute(
      () => mastersService.findNearbyMasters(nearbyParams),
      'Ближайшие мастера найдены'
    );
  };

  const handleGetMasterStats = async () => {
    await apiCall.execute(
      () => mastersService.getMasterStats(),
      'Статистика мастера получена'
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

  return (
    <div className="tester-section">
      <h2>👩‍🎨 Тестирование мастеров</h2>

      {/* Управление дизайнами "Я так могу" */}
      <div className="form-section">
        <h3>Управление "Я так могу"</h3>
        
        <UuidSearch
          label="Поиск дизайна"
          placeholder="Введите название или описание дизайна"
          value={designId}
          onChange={setDesignId}
          onSearch={handleSearchDesigns}
        />
        
        <div className="actions-row">
          <button onClick={handleAddCanDoDesign} disabled={apiCall.loading}>
            Добавить в "Я так могу"
          </button>
          <button onClick={handleRemoveCanDoDesign} disabled={apiCall.loading}>
            Удалить из "Я так могу"
          </button>
          <button onClick={handleGetMasterDesigns} disabled={apiCall.loading}>
            Получить мои дизайны
          </button>
        </div>
      </div>

      {/* Профиль мастера */}
      <div className="form-section">
        <h3>Профиль мастера</h3>
        
        <UuidSearch
          label="Поиск мастера (оставьте пустым для своего профиля)"
          placeholder="Введите имя или адрес мастера"
          value={masterId}
          onChange={setMasterId}
          onSearch={handleSearchMasters}
        />
        
        <button onClick={handleGetMasterProfile} disabled={apiCall.loading}>
          Получить профиль
        </button>
      </div>

      {/* Обновление профиля */}
      <div className="form-section">
        <h3>Обновление профиля</h3>
        <div className="form-group">
          <label>Полное имя:</label>
          <input
            type="text"
            value={profileData.fullName || ''}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Адрес:</label>
          <input
            type="text"
            value={profileData.address || ''}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Широта:</label>
          <input
            type="number"
            step="0.000001"
            value={profileData.location?.lat || 0}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              location: { 
                ...profileData.location!, 
                lat: parseFloat(e.target.value) || 0 
              } 
            })}
          />
        </div>
        <div className="form-group">
          <label>Долгота:</label>
          <input
            type="number"
            step="0.000001"
            value={profileData.location?.lng || 0}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              location: { 
                ...profileData.location!, 
                lng: parseFloat(e.target.value) || 0 
              } 
            })}
          />
        </div>
        <div className="form-group">
          <label>Описание:</label>
          <textarea
            value={profileData.description || ''}
            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
          />
        </div>
        <button onClick={handleUpdateMasterProfile} disabled={apiCall.loading}>
          {apiCall.loading ? 'Обновление...' : 'Обновить профиль'}
        </button>
      </div>

      {/* Поиск ближайших мастеров */}
      <div className="form-section">
        <h3>Поиск ближайших мастеров</h3>
        
        <UuidSearch
          label="Поиск дизайна для поиска мастеров"
          placeholder="Введите название или описание дизайна"
          value={nearbyParams.designId}
          onChange={(value) => setNearbyParams({ ...nearbyParams, designId: value })}
          onSearch={handleSearchDesigns}
        />
        
        <div className="form-group">
          <label>Широта:</label>
          <input
            type="number"
            step="0.000001"
            value={nearbyParams.lat}
            onChange={(e) => setNearbyParams({ ...nearbyParams, lat: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="form-group">
          <label>Долгота:</label>
          <input
            type="number"
            step="0.000001"
            value={nearbyParams.lng}
            onChange={(e) => setNearbyParams({ ...nearbyParams, lng: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="form-group">
          <label>Радиус (км):</label>
          <input
            type="number"
            value={nearbyParams.radius || 10}
            onChange={(e) => setNearbyParams({ ...nearbyParams, radius: parseInt(e.target.value) || 10 })}
          />
        </div>
        <button onClick={handleFindNearbyMasters} disabled={apiCall.loading}>
          {apiCall.loading ? 'Поиск...' : 'Найти мастеров'}
        </button>
      </div>

      {/* Статистика */}
      <div className="form-section">
        <h3>Статистика мастера</h3>
        <button onClick={handleGetMasterStats} disabled={apiCall.loading}>
          Получить статистику
        </button>
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