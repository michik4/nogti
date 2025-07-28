import React, { useState, useEffect, useRef } from 'react';
import './UuidSearch.css';

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

interface UuidSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<SearchItem[]>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  minQueryLength?: number;
  className?: string;
}

export const UuidSearch: React.FC<UuidSearchProps> = ({
  placeholder = 'Поиск...',
  value,
  onChange,
  onSearch,
  label,
  required = false,
  disabled = false,
  minQueryLength = 2,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Обработчик клика вне компонента для скрытия результатов
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Обработчик изменения поля ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Если поле пустое, очищаем результаты
    if (!newQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Задержка запроса для предотвращения частых запросов при быстром вводе
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Если запрос слишком короткий, не выполняем поиск
    if (newQuery.trim().length < minQueryLength) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await onSearch(newQuery);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setError('Ошибка при выполнении поиска');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Обработчик выбора элемента из результатов
  const handleSelectItem = (item: SearchItem) => {
    setSelectedItem(item);
    setQuery(item.title);
    onChange(item.id);
    setShowResults(false);
  };

  // Обработчик очистки поля
  const handleClear = () => {
    setQuery('');
    setSelectedItem(null);
    onChange('');
    setResults([]);
    setShowResults(false);
  };

  // Обработчик фокуса на поле ввода
  const handleFocus = () => {
    if (query.trim().length >= minQueryLength) {
      setShowResults(true);
    }
  };

  // Ручной ввод UUID
  const handleManualIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`uuid-search-container ${className}`} ref={searchContainerRef}>
      {label && (
        <label className="uuid-search-label">
          {label} {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className="uuid-search-input-container">
        <div className="uuid-search-query-container">
          <input
            type="text"
            className="uuid-search-input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
          />
          {(query || value) && (
            <button 
              className="uuid-search-clear-btn" 
              onClick={handleClear}
              type="button"
              disabled={disabled}
            >
              ×
            </button>
          )}
          {loading && <div className="uuid-search-spinner">⏳</div>}
        </div>
        
        <div className="uuid-search-manual-container">
          <input
            type="text"
            className="uuid-search-manual-input"
            placeholder="Или введите ID вручную"
            value={value}
            onChange={handleManualIdInput}
            disabled={disabled}
          />
        </div>
      </div>
      
      {showResults && results.length > 0 && (
        <div className="uuid-search-results">
          {results.map((item) => (
            <div
              key={item.id}
              className="uuid-search-result-item"
              onClick={() => handleSelectItem(item)}
            >
              {item.imageUrl && (
                <div className="uuid-search-result-image">
                  <img src={item.imageUrl} alt={item.title} />
                </div>
              )}
              <div className="uuid-search-result-content">
                <div className="uuid-search-result-title">{item.title}</div>
                {item.subtitle && (
                  <div className="uuid-search-result-subtitle">{item.subtitle}</div>
                )}
                <div className="uuid-search-result-id">{item.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showResults && results.length === 0 && !loading && query.trim().length >= minQueryLength && (
        <div className="uuid-search-no-results">
          Ничего не найдено
        </div>
      )}
      
      {error && <div className="uuid-search-error">{error}</div>}
    </div>
  );
}; 