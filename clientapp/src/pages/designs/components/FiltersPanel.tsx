import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GetDesignsParams } from '@/services/designService';
import { AVAILABLE_COLORS } from '@/utils/color.util';
import styles from './FiltersPanel.module.css';

interface FiltersPanelProps {
  filters: GetDesignsParams;
  onApply: (filters: Partial<GetDesignsParams>) => void;
  onReset: () => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onApply,
  onReset
}) => {
  const [localFilters, setLocalFilters] = useState<GetDesignsParams>(filters);
  const [customTags, setCustomTags] = useState<string[]>(
    filters.tags ? filters.tags.split(',') : []
  );
  const [newTag, setNewTag] = useState('');

  // Предустановленные популярные теги
  const popularTags = [
    'френч',
    'омбре',
    'глиттер',
    'матовый',
    'геометрия',
    'цветы',
    'абстракция',
    'минимализм',
    'нюд',
    'вечерний',
    'свадебный',
    'праздничный',
    'повседневный',
    'стразы',
    'роспись'
  ];



  const handleFilterChange = (key: keyof GetDesignsParams, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !customTags.includes(tag)) {
      const newTags = [...customTags, tag];
      setCustomTags(newTags);
      handleFilterChange('tags', newTags.join(','));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = customTags.filter(tag => tag !== tagToRemove);
    setCustomTags(newTags);
    handleFilterChange('tags', newTags.length > 0 ? newTags.join(',') : undefined);
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      handleAddTag(newTag.trim());
    }
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      page: 1,
      limit: 12,
    });
    setCustomTags([]);
    setNewTag('');
    onReset();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры</h3>
      </div>

      <div className={styles.content}>
        {/* Тип дизайна */}
        <div className={styles.filterGroup}>
          <Label className={styles.label}>Тип дизайна</Label>
          <Select 
            value={localFilters.type || 'all'} 
            onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="basic">Базовый</SelectItem>
              <SelectItem value="designer">Дизайнерский</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Источник */}
        <div className={styles.filterGroup}>
          <Label className={styles.label}>Источник</Label>
          <Select 
            value={localFilters.source || 'all'} 
            onValueChange={(value) => handleFilterChange('source', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="Выберите источник" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все источники</SelectItem>
              <SelectItem value="admin">Администратор</SelectItem>
              <SelectItem value="master">Мастер</SelectItem>
              <SelectItem value="client">Клиент</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Цвет */}
        <div className={styles.filterGroup}>
          <Label className={styles.label}>Основной цвет</Label>
          <div className={styles.colorGrid}>
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`${styles.colorSwatch} ${
                  localFilters.color === color.value ? styles.selected : ''
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                onClick={() => handleFilterChange('color', 
                  localFilters.color === color.value ? undefined : color.value
                )}
              />
            ))}
          </div>

        </div>

        {/* Теги */}
        <div className={styles.filterGroup}>
          <Label className={styles.label}>Теги</Label>
          
          {/* Популярные теги */}
          <div className={styles.popularTags}>
            <p className={styles.tagsSubtitle}>Популярные теги:</p>
            <div className={styles.tagsGrid}>
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={customTags.includes(tag) ? "default" : "outline"}
                  className={styles.tagButton}
                  onClick={() => {
                    if (customTags.includes(tag)) {
                      handleRemoveTag(tag);
                    } else {
                      handleAddTag(tag);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Добавление кастомного тега */}
          <form onSubmit={handleAddCustomTag} className={styles.customTagForm}>
            <Input
              type="text"
              placeholder="Добавить свой тег..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className={styles.tagInput}
            />
            <Button type="submit" size="sm" variant="outline">
              Добавить
            </Button>
          </form>

          {/* Выбранные теги */}
          {customTags.length > 0 && (
            <div className={styles.selectedTags}>
              <p className={styles.tagsSubtitle}>Выбранные теги:</p>
              <div className={styles.tagsGrid}>
                {customTags.map((tag) => (
                  <Badge key={tag} variant="default" className={styles.selectedTag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTagButton}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Действия */}
      <div className={styles.actions}>
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