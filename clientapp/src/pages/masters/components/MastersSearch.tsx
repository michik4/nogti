import React from 'react';
import { Search, Filter, MapPin, Star, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import styles from './MastersSearch.module.css';

interface MastersSearchProps {
  searchQuery: string;
  selectedCity: string;
  selectedSpecialty: string;
  sortBy: 'rating' | 'experience' | 'price';
  onSearchChange: (query: string) => void;
  onCityChange: (city: string) => void;
  onSpecialtyChange: (specialty: string) => void;
  onSortChange: (sort: 'rating' | 'experience' | 'price') => void;
}

const MastersSearch: React.FC<MastersSearchProps> = ({
  searchQuery,
  selectedCity,
  selectedSpecialty,
  sortBy,
  onSearchChange,
  onCityChange,
  onSpecialtyChange,
  onSortChange
}) => {
  const cities = [
    'Москва',
    'Санкт-Петербург',
    'Новосибирск',
    'Екатеринбург',
    'Казань',
    'Нижний Новгород',
    'Челябинск',
    'Самара',
    'Омск',
    'Ростов-на-Дону'
  ];

  const specialties = [
    'Классический маникюр',
    'Аппаратный маникюр',
    'Гель-лак',
    'Наращивание ногтей',
    'Дизайн ногтей',
    'Педикюр',
    'Парафинотерапия',
    'Стемпинг',
    'Роспись ногтей',
    'Французский маникюр'
  ];

  const clearFilters = () => {
    onSearchChange('');
    onCityChange('');
    onSpecialtyChange('');
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedSpecialty;

  return (
    <Card className={styles.searchCard}>
      <CardContent className={styles.searchContent}>
        {/* Основная строка поиска */}
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени мастера или специальности..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {/* Фильтры */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <div className={styles.filterItem}>
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.filterItem}>
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue placeholder="Специальность" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.filterItem}>
              <SortAsc className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <div className={styles.sortOption}>
                      <Star className="w-4 h-4" />
                      По рейтингу
                    </div>
                  </SelectItem>
                  <SelectItem value="experience">
                    По опыту
                  </SelectItem>
                  <SelectItem value="price">
                    По цене
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Кнопка очистки фильтров */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className={styles.clearButton}
            >
              Очистить фильтры
            </Button>
          )}
        </div>

        {/* Активные фильтры */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            {searchQuery && (
              <Badge variant="secondary" className={styles.filterBadge}>
                Поиск: {searchQuery}
                <button
                  onClick={() => onSearchChange('')}
                  className={styles.removeBadge}
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="secondary" className={styles.filterBadge}>
                <MapPin className="w-3 h-3" />
                {selectedCity}
                <button
                  onClick={() => onCityChange('')}
                  className={styles.removeBadge}
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSpecialty && (
              <Badge variant="secondary" className={styles.filterBadge}>
                <Filter className="w-3 h-3" />
                {selectedSpecialty}
                <button
                  onClick={() => onSpecialtyChange('')}
                  className={styles.removeBadge}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MastersSearch; 