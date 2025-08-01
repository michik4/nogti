import React from 'react';
import { Heart, Eye, Users, DollarSign, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NailDesign } from '@/services/designService';
import { getImageUrl } from '@/utils/image.util';
import { getColorHex } from '@/utils/color.util';
import styles from './DesignCard.module.css';

interface DesignCardProps {
  design: NailDesign;
  onLike?: (designId: string) => void;
  onView?: (designId: string) => void;
  isLiked?: boolean;
  showStats?: boolean;
}

const DesignCard: React.FC<DesignCardProps> = ({
  design,
  onLike,
  onView,
  isLiked = false,
  showStats = true
}) => {
  const handleLike = () => {
    if (onLike) {
      onLike(design.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(design.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <div className={styles.imageContainer}>
          <img
            src={getImageUrl(design.imageUrl)}
            alt={design.title}
            className={styles.image}
          />
          
          {/* Наложение с действиями */}
          <div className={styles.overlay}>
            <div className={styles.actions}>
              {onLike && (
                <button
                  onClick={handleLike}
                  className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                  aria-label="Нравится"
                >
                  <Heart className="w-4 h-4" />
                </button>
              )}
              
              {onView && (
                <button
                  onClick={handleView}
                  className={styles.actionButton}
                  aria-label="Просмотр"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Цветовой индикатор */}
          {design.color && (
            <div 
              className={styles.colorIndicator}
              style={{ backgroundColor: getColorHex(design.color) }}
              title={design.color}
            />
          )}
        </div>

        <div className={styles.header}>
          <h3 className={styles.title}>{design.title}</h3>
          {design.minPrice ? (
            <span className={styles.price}>
              от {formatPrice(design.minPrice)}
            </span>
          ) : (
            <div className={styles.noServicesInfo}>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className={styles.noServicesText}>Нет услуг</span>
            </div>
          )}
        </div>

        {design.description && (
          <p className={styles.description}>{design.description}</p>
        )}

        <div className={styles.tags}>
          <Badge variant="outline" className={styles.typeBadge}>
            {design.type === 'basic' ? 'Базовый' : 'Дизайнерский'}
          </Badge>
          {design.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className={styles.tag}>
              {tag}
            </Badge>
          ))}
        </div>

        {showStats && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <Heart className="w-3 h-3" />
              <span>{design.likesCount}</span>
            </div>
            <div className={styles.stat}>
              <Users className="w-3 h-3" />
              <span>{design.ordersCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DesignCard; 