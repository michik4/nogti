import React from 'react';
import { Heart, Eye, Users, DollarSign, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NailDesign } from '@/services/designService';
import { useLike } from '@/hooks/useLike';
import { useAuth } from '@/contexts/AuthContext';
import { getColorHex } from '@/utils/color.util';
import { getImageUrl } from '@/utils/image.util';
import styles from './DesignCard.module.css';

interface DesignCardProps {
  design: NailDesign;
  onViewDetails: () => void;
  onViewMasters: () => void;
}

export const DesignCard: React.FC<DesignCardProps> = ({ 
  design, 
  onViewDetails, 
  onViewMasters 
}) => {
  const { user } = useAuth();
  const { isLiked, likesCount, handleLike, isLoading: isLikeLoading, canLike } = useLike({
    designId: design.id,
    initialLikesCount: design.likesCount,
    initialIsLiked: design.isLiked
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'admin': return 'Администратор';
      case 'master': return 'Мастер';
      case 'client': return 'Клиент';
      default: return source;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'basic': return 'Базовый';
      case 'designer': return 'Дизайнерский';
      default: return type;
    }
  };



  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canLike) {
      handleLike();
    }
  };

  return (
    <Card className={styles.card} onClick={onViewDetails}>
      <div className={styles.imageContainer}>
        <img 
                          src={getImageUrl(design.imageUrl) || '/placeholder.svg'} 
          alt={design.title}
          className={styles.image}
          loading="lazy"
        />
        
        {/* Статусы и теги */}
        <div className={styles.badges}>
          <Badge 
            variant={design.type === 'designer' ? 'default' : 'secondary'}
            className={styles.typeBadge}
          >
            {getTypeLabel(design.type)}
          </Badge>
          
          <Badge variant="outline" className={styles.sourceBadge}>
            {getSourceLabel(design.source)}
          </Badge>
        </div>

        {/* Кнопка лайка */}
        {canLike && (
          <Button
            variant="ghost"
            size="sm"
            className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
            onClick={handleLikeClick}
            disabled={isLikeLoading}
          >
            <Heart 
              className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
            />
          </Button>
        )}
      </div>

      <CardContent className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{design.title}</h3>
          {design.estimatedPrice && (
            <span className={styles.price}>
              {formatPrice(design.estimatedPrice)}
            </span>
          )}
        </div>

        {design.description && (
          <p className={styles.description}>
            {design.description.length > 100 
              ? `${design.description.substring(0, 100)}...` 
              : design.description
            }
          </p>
        )}

        {/* Цвет */}
        {design.color && (
          <div className={styles.colorInfo}>
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: getColorHex(design.color) }}
              title={design.color}
            />
            <span className={styles.colorText}>{design.color}</span>
          </div>
        )}

        {/* Теги */}
        {design.tags && design.tags.length > 0 && (
          <div className={styles.tags}>
            {design.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className={styles.tag}>
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {design.tags.length > 3 && (
              <Badge variant="outline" className={styles.tag}>
                +{design.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Статистика */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <Heart className="w-4 h-4 text-red-500" />
            <span>{likesCount}</span>
          </div>
          <div className={styles.stat}>
            <Eye className="w-4 h-4 text-blue-500" />
            <span>{design.ordersCount}</span>
          </div>
        </div>

        {/* Действия */}
        <div className={styles.actions}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className={styles.actionButton}
          >
            <Eye className="w-4 h-4" />
            Подробнее
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewMasters();
            }}
            className={styles.actionButton}
          >
            <Users className="w-4 h-4" />
            Мастера
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 