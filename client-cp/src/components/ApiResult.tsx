import React from 'react';

interface ApiResultProps {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
  onClear?: () => void;
}

export const ApiResult: React.FC<ApiResultProps> = ({ 
  loading, 
  error, 
  success, 
  data, 
  onClear 
}) => {
  if (loading) {
    return (
      <div className="result-section loading">
        <div className="loading-spinner">⏳</div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-section error">
        <div className="result-header">
          <h3>❌ Ошибка</h3>
          {onClear && (
            <button className="clear-btn" onClick={onClear}>
              ✕
            </button>
          )}
        </div>
        <p className="error-message">{error}</p>
        {data && (
          <div className="result-content">
            <h4>Детали ошибки (JSON):</h4>
            <pre className="result-data">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="result-section success">
        <div className="result-header">
          <h3>✅ Успешно</h3>
          {onClear && (
            <button className="clear-btn" onClick={onClear}>
              ✕
            </button>
          )}
        </div>
        <div className="result-content">
          <h4>JSON ответ:</h4>
          <pre className="result-data">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return null;
}; 