import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Search, Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { designService, NailDesign, GetDesignsParams } from '@/services/designService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DesignCard } from './components/DesignCard';
import { FiltersPanel } from './components/FiltersPanel';
import { MastersList } from './components/MastersList';
import PageHeader from '@/components/PageHeader';
import styles from './designs.page.module.css';

export const DesignsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDesign, setSelectedDesign] = useState<NailDesign | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMasters, setShowMasters] = useState(false);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Фильтры
  const [filters, setFilters] = useState<GetDesignsParams>({
    page: 1,
    limit: 12,
    type: searchParams.get('type') as 'basic' | 'designer' || undefined,
    source: searchParams.get('source') as 'admin' | 'client' | 'master' || undefined,
    color: searchParams.get('color') || undefined,
    tags: searchParams.get('tags') || undefined,
  });

  // Загрузка дизайнов
  const loadDesigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: currentPage,
      };

      let response;
      if (searchQuery.trim()) {
        response = await designService.searchDesigns(searchQuery, params);
      } else {
        response = await designService.getAllDesigns(params);
      }

      if (response.success && response.data) {
        setDesigns(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalCount(response.pagination.total);
        }
      } else {
        setError(response.error || 'Ошибка загрузки дизайнов');
      }
    } catch (err) {
      setError('Ошибка сети');
      console.error('Ошибка загрузки дизайнов:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновляем URL параметры при изменении фильтров
  const updateURLParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (filters.type) params.set('type', filters.type);
    if (filters.source) params.set('source', filters.source);
    if (filters.color) params.set('color', filters.color);
    if (filters.tags) params.set('tags', filters.tags);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  };

  // Загружаем дизайны при изменении фильтров или страницы
  useEffect(() => {
    loadDesigns();
    updateURLParams();
  }, [filters, currentPage, searchQuery]);

  // Обработка поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDesigns();
  };

  // Применение фильтров
  const handleFiltersApply = (newFilters: Partial<GetDesignsParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Сброс фильтров
  const handleFiltersReset = () => {
    setFilters({
      page: 1,
      limit: 12,
    });
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Просмотр мастеров для дизайна
  const handleViewMasters = (design: NailDesign) => {
    setSelectedDesign(design);
    setShowMasters(true);
  };

  // Переход к детальному просмотру дизайна
  const handleViewDesign = (designId: string) => {
    navigate(`/designs/${designId}`);
  };

  // Пагинация
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.designsPage}>
      {/* Заголовок страницы */}
      <PageHeader
        title="Дизайны маникюра"
        
        onBackClick={() => navigate(-1)}
      />

      <main className={styles.main}>
        {/* Поиск и фильтры */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <Input
                type="text"
                placeholder="Поиск дизайнов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <Button type="submit" variant="default" className={styles.searchButton}>
              <Search className="w-4 h-4" />
              Найти
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filtersButton}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
            </Button>
          </form>
        </div>

          {/* Активные фильтры */}
          {(filters.type || filters.source || filters.color || filters.tags) && (
            <div className={styles.activeFilters}>
              <div className={styles.filterTags}>
                {filters.type && (
                  <Badge variant="secondary" className={styles.filterTag}>
                    Тип: {filters.type === 'basic' ? 'Базовый' : 'Дизайнерский'}
                  </Badge>
                )}
                {filters.source && (
                  <Badge variant="secondary" className={styles.filterTag}>
                    Источник: {filters.source === 'admin' ? 'Администратор' : 
                             filters.source === 'master' ? 'Мастер' : 'Клиент'}
                  </Badge>
                )}
                {filters.color && (
                  <Badge variant="secondary" className={styles.filterTag}>
                    Цвет: {filters.color}
                  </Badge>
                )}
                {filters.tags && (
                  <Badge variant="secondary" className={styles.filterTag}>
                    Теги: {filters.tags}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFiltersReset}
                className={styles.resetButton}
              >
                Сбросить все
              </Button>
            </div>
          )}

          {/* Панель фильтров */}
          {showFilters && (
            <Card className={styles.filtersCard}>
              <CardContent className={styles.filtersContent}>
                <FiltersPanel
                  filters={filters}
                  onApply={handleFiltersApply}
                  onReset={handleFiltersReset}
                />
              </CardContent>
            </Card>
          )}

            {/* Статистика */}
            {!isLoading && (
              <div className={styles.stats}>
                <div className={styles.statsItem}>
                  <span className={styles.statsNumber}>
                    {isLoading ? '...' : designs.length}
                  </span>
                  <span className={styles.statsLabel}>
                    {designs.length === 1 ? 'дизайн найден' : 'дизайнов найдено'}
                  </span>
                </div>
                {searchQuery && (
                  <div className={styles.searchInfo}>
                    Результаты поиска для: <strong>"{searchQuery}"</strong>
                  </div>
                )}
              </div>
            )}

            {/* Лоадер */}
            {isLoading && (
              <div className={styles.loader}>
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Загрузка дизайнов...</p>
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
                <Button onClick={loadDesigns} variant="outline">
                  Попробовать снова
                </Button>
              </div>
            )}

            {/* Список дизайнов */}
            {!isLoading && !error && designs.length > 0 && (
              <div className={styles.designsGrid}>
                {designs.map((design) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    onViewDetails={() => handleViewDesign(design.id)}
                    onViewMasters={() => handleViewMasters(design)}
                    onDesignAdded={() => {
                      // Обновляем статистику или другие данные при необходимости
                      console.log('Дизайн добавлен в услуги мастера');
                    }}
                  />
                ))}
              </div>
            )}

            {/* Пустое состояние */}
            {!isLoading && !error && designs.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Filter className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className={styles.emptyStateTitle}>
                  Дизайны не найдены
                </h3>
                <p className={styles.emptyStateDescription}>
                  Попробуйте изменить параметры поиска или фильтры
                </p>
                <Button onClick={handleFiltersReset} variant="outline">
                  Сбросить фильтры
                </Button>
              </div>
            )}

            {/* Пагинация */}
            {!isLoading && !error && designs.length > 0 && totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Предыдущая
                </Button>
                
                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className={styles.pageButton}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Следующая
                </Button>
              </div>
            )}
          </main>

      {/* Модальное окно со списком мастеров */}
      {showMasters && selectedDesign && (
        <MastersList
          design={selectedDesign}
          isOpen={showMasters}
          onClose={() => {
            setShowMasters(false);
            setSelectedDesign(null);
          }}
        />
      )}
    </div>
  );
}; 