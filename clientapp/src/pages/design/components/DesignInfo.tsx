import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Heart, BookOpen, Calendar } from 'lucide-react';
import { NailDesign } from '@/services/designService';
import { getColorHex } from '@/utils/color.util';
import styles from './DesignInfo.module.css';

interface DesignInfoProps {
  design: NailDesign;
}

const DesignInfo: React.FC<DesignInfoProps> = ({ design }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };



  return (
    <Card className={styles.infoCard}>
      <CardHeader>
        <CardTitle className={styles.title}>Информация о дизайне</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {design.description && (
          <div className={styles.description}>
            <p>{design.description}</p>
          </div>
        )}

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <Heart className="w-4 h-4 text-red-500" />
            <span>{design.likesCount} лайков</span>
          </div>
          <div className={styles.statItem}>
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>{design.ordersCount} заказов</span>
          </div>
        </div>

        {design.estimatedPrice && (
          <div className={styles.priceInfo}>
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className={styles.price}>
              Примерная стоимость: {formatPrice(design.estimatedPrice)}
            </span>
          </div>
        )}

        {design.color && (
          <div className={styles.colorInfo}>
            <span className={styles.colorLabel}>Основной цвет:</span>
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: getColorHex(design.color) }}
              title={design.color}
            />
            <span className={styles.colorValue}>{design.color}</span>
          </div>
        )}

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <Calendar className="w-4 h-4" />
            <span>Создан: {formatDate(design.createdAt)}</span>
          </div>
          
          <div className={styles.statusBadges}>
            <Badge 
              variant={design.isActive ? "default" : "secondary"}
              className={styles.statusBadge}
            >
              {design.isActive ? 'Активен' : 'Неактивен'}
            </Badge>
            
            <Badge 
              variant={design.isModerated ? "default" : "outline"}
              className={styles.statusBadge}
            >
              {design.isModerated ? 'Проверен' : 'На модерации'}
            </Badge>
            
            <Badge variant="outline" className={styles.sourceBadge}>
              {design.source === 'admin' ? 'Администратор' : 
               design.source === 'master' ? 'Мастер' : 'Клиент'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignInfo; 