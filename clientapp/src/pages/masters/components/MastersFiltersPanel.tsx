import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import styles from './MastersFiltersPanel.module.css';

interface MastersFiltersPanelProps {
  selectedCity: string;
  selectedSpecialty: string;
  sortBy: 'rating' | 'experience' | 'price';
  onApply: (filters: { city: string; specialty: string; sortBy: 'rating' | 'experience' | 'price' }) => void;
  onReset: () => void;
}

export const MastersFiltersPanel: React.FC<MastersFiltersPanelProps> = ({
  selectedCity,
  selectedSpecialty,
  sortBy,
  onApply,
  onReset
}) => {
  const [localCity, setLocalCity] = useState(selectedCity);
  const [localSpecialty, setLocalSpecialty] = useState(selectedSpecialty);
  const [localSortBy, setLocalSortBy] = useState(sortBy);

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

  const handleApply = () => {
    onApply({
      city: localCity,
      specialty: localSpecialty,
      sortBy: localSortBy
    });
  };

  const handleReset = () => {
    setLocalCity('');
    setLocalSpecialty('');
    setLocalSortBy('rating');
    onReset();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры мастеров</h3>
      </div>

      <div className={styles.content}>
        {/* Город */}
        <div className={styles.filterGroup}>
          <Label htmlFor="city" className={styles.label}>
            Город
          </Label>
          <Select value={localCity} onValueChange={setLocalCity}>
            <SelectTrigger className={styles.select}>
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

        {/* Специальность */}
        <div className={styles.filterGroup}>
          <Label htmlFor="specialty" className={styles.label}>
            Специальность
          </Label>
          <Select value={localSpecialty} onValueChange={setLocalSpecialty}>
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Выберите специальность" />
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

        {/* Сортировка */}
        <div className={styles.filterGroup}>
          <Label htmlFor="sortBy" className={styles.label}>
            Сортировка
          </Label>
          <Select value={localSortBy} onValueChange={(value: 'rating' | 'experience' | 'price') => setLocalSortBy(value)}>
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Выберите сортировку" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">
                По рейтингу
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

      <div className={styles.footer}>
        <Button variant="outline" onClick={handleReset} className={styles.resetButton}>
          Сбросить
        </Button>
        <Button onClick={handleApply} className={styles.applyButton}>
          Применить
        </Button>
      </div>
    </div>
  );
}; 