import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Heart, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { NailDesign } from '@/services/designService';
import { getColorHex } from '@/utils/color.util';
import styles from './DesignInfo.module.css';

interface DesignInfoProps {
  design: NailDesign;
}

const DesignInfo: React.FC<DesignInfoProps> = ({ design }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle className={styles.title}>Информация о дизайне</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className={styles.label}>Тип:</span>
            <span className={styles.value}>
              {design.type === 'basic' ? 'Базовый' : 'Дизайнерский'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <Heart className="w-4 h-4 text-red-500" />
            <span className={styles.label}>Лайки:</span>
            <span className={styles.value}>{design.likesCount}</span>
          </div>

          <div className={styles.infoItem}>
            <Calendar className="w-4 h-4 text-green-500" />
            <span className={styles.label}>Заказы:</span>
            <span className={styles.value}>{design.ordersCount}</span>
          </div>

          {design.minPrice ? (
            <div className={styles.infoItem}>
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className={styles.label}>Цена услуг:</span>
              <span className={styles.price}>
                от {formatPrice(design.minPrice)}
              </span>
            </div>
          ) : (
            <div className={styles.noServicesInfo}>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className={styles.noServicesText}>
                Пока нет услуг с этим дизайном
              </span>
            </div>
          )}

          {design.color && (
            <div className={styles.colorInfo}>
              <span className={styles.label}>Цвет:</span>
              <div className={styles.colorDisplay}>
                <div 
                  className={styles.colorSwatch}
                  style={{ backgroundColor: getColorHex(design.color) }}
                  title={design.color}
                />
                <span className={styles.colorText}>{design.color}</span>
              </div>
            </div>
          )}

          {design.tags && design.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <span className={styles.label}>Теги:</span>
              <div className={styles.tags}>
                {design.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className={styles.tag}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {design.description && (
          <div className={styles.description}>
            <h4 className={styles.descriptionTitle}>Описание</h4>
            <p className={styles.descriptionText}>{design.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DesignInfo; 