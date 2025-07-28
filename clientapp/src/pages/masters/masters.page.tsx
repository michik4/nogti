import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { masterService } from '@/services/masterService';
import { Master } from '@/types/user.types';
import MastersSearch from './components/MastersSearch';
import MastersGrid from './components/MastersGrid';
import styles from './masters.page.module.css';

interface MastersPageProps {}

const MastersPage: React.FC<MastersPageProps> = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [masters, setMasters] = useState<Master[]>([]);
  const [filteredMasters, setFilteredMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price'>('rating');

  // Загрузка мастеров при монтировании компонента
  useEffect(() => {
    loadMasters();
  }, []);

  // Фильтрация мастеров при изменении поисковых критериев
  useEffect(() => {
    filterMasters();
  }, [masters, searchQuery, selectedCity, selectedSpecialty, sortBy]);

  const loadMasters = async () => {
    try {
      setIsLoading(true);
      const response = await masterService.getAllMasters();
      
      if (response.success && response.data) {
        setMasters(response.data);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить список мастеров",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке мастеров",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMasters = () => {
    let filtered = [...masters];

    // Поиск по имени, описанию или специальностям
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(master => 
        master.fullName?.toLowerCase().includes(query) ||
        master.description?.toLowerCase().includes(query) ||
        master.specialties?.some(spec => spec.toLowerCase().includes(query))
      );
    }

    // Фильтр по городу
    if (selectedCity) {
      filtered = filtered.filter(master => 
        master.address?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Фильтр по специальности
    if (selectedSpecialty) {
      filtered = filtered.filter(master => 
        master.specialties?.includes(selectedSpecialty)
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.experience || '').localeCompare(a.experience || '');
        case 'price':
          // Сортировка по цене (если есть)
          return 0;
        default:
          return 0;
      }
    });

    setFilteredMasters(filtered);
  };

  const handleMasterClick = (masterId: string) => {
    navigate(`/master/${masterId}`);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
  };

  const handleSortChange = (sort: 'rating' | 'experience' | 'price') => {
    setSortBy(sort);
  };

  return (
    <div className={styles.mastersPage}>
      {/* Заголовок страницы */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className={styles.headerTitle}>
            <h1>Мастера маникюра</h1>
            <p className={styles.subtitle}>
              Найдите лучших мастеров в вашем городе
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Поиск и фильтры */}
        <MastersSearch
          searchQuery={searchQuery}
          selectedCity={selectedCity}
          selectedSpecialty={selectedSpecialty}
          sortBy={sortBy}
          onSearchChange={handleSearchChange}
          onCityChange={handleCityChange}
          onSpecialtyChange={handleSpecialtyChange}
          onSortChange={handleSortChange}
        />

        {/* Статистика */}
        <div className={styles.stats}>
          <div className={styles.statsItem}>
            <span className={styles.statsNumber}>
              {isLoading ? '...' : filteredMasters.length}
            </span>
            <span className={styles.statsLabel}>
              {filteredMasters.length === 1 ? 'мастер найден' : 'мастеров найдено'}
            </span>
          </div>
          {searchQuery && (
            <div className={styles.searchInfo}>
              Результаты поиска для: <strong>"{searchQuery}"</strong>
            </div>
          )}
        </div>

        {/* Сетка мастеров */}
        <MastersGrid
          masters={filteredMasters}
          isLoading={isLoading}
          onMasterClick={handleMasterClick}
        />

        {/* Пустое состояние */}
        {!isLoading && filteredMasters.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className={styles.emptyStateTitle}>
              Мастера не найдены
            </h3>
            <p className={styles.emptyStateDescription}>
              Попробуйте изменить параметры поиска или очистить фильтры
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
                setSelectedSpecialty('');
              }}
            >
              Очистить фильтры
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MastersPage; 