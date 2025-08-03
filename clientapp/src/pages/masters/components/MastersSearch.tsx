import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MastersFiltersPanel } from './MastersFiltersPanel';
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
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onCityChange('');
    onSpecialtyChange('');
  };

  const handleFiltersApply = (filters: { city: string; specialty: string; sortBy: 'rating' | 'experience' | 'price' }) => {
    onCityChange(filters.city);
    onSpecialtyChange(filters.specialty);
    onSortChange(filters.sortBy);
    setShowFilters(false);
  };

  const handleFiltersReset = () => {
    onCityChange('');
    onSpecialtyChange('');
    onSortChange('rating');
    setShowFilters(false);
  };

  const hasActiveFilters = selectedCity || selectedSpecialty;

  return (
    <div className={styles.searchSection}>
      <form className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder="Поиск по имени мастера или специальности..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
          <Filter className="w-4 h-4" />
          Фильтры
        </Button>
      </form>

      {/* Панель фильтров */}
      {showFilters && (
        <Card className={styles.filtersCard}>
          <CardContent className={styles.filtersContent}>
            <MastersFiltersPanel
              selectedCity={selectedCity}
              selectedSpecialty={selectedSpecialty}
              sortBy={sortBy}
              onApply={handleFiltersApply}
              onReset={handleFiltersReset}
            />
          </CardContent>
        </Card>
      )}

      {/* Активные фильтры */}
      {(selectedCity || selectedSpecialty) && (
        <div className={styles.activeFilters}>
          <div className={styles.filterTags}>
            {selectedCity && (
              <Badge variant="secondary" className={styles.filterTag}>
                Город: {selectedCity}
              </Badge>
            )}
            {selectedSpecialty && (
              <Badge variant="secondary" className={styles.filterTag}>
                Специальность: {selectedSpecialty}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={styles.resetButton}
          >
            Сбросить все
          </Button>
        </div>
      )}
    </div>
  );
};

export default MastersSearch; 