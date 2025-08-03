import React, { useState, useEffect } from 'react';
import { Heart, Eye, Users, DollarSign, Tag, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NailDesign } from '@/services/designService';
import { useLike } from '@/hooks/useLike';
import { useAuth } from '@/contexts/AuthContext';
import { getColorHex } from '@/utils/color.util';
import { getImageUrl } from '@/utils/image.util';
import { masterService } from '@/services/masterService';
import { useToast } from '@/hooks/use-toast';
import styles from './DesignCard.module.css';

interface DesignCardProps {
  design: NailDesign;
  onViewDetails: () => void;
  onViewMasters: () => void;
  onDesignAdded?: () => void; // Callback для обновления списка
}

export const DesignCard: React.FC<DesignCardProps> = ({ 
  design, 
  onViewDetails, 
  onViewMasters,
  onDesignAdded
}) => {
  const { user, isMaster } = useAuth();
  const { toast } = useToast();
  const [isAddingToServices, setIsAddingToServices] = useState(false);
  const [isInMyDesigns, setIsInMyDesigns] = useState(false);
  
  const { isLiked, likesCount, handleLike, isLoading: isLikeLoading, canLike } = useLike({
    designId: design.id,
    initialLikesCount: design.likesCount,
    initialIsLiked: design.isLiked
  });

  // Проверяем, есть ли дизайн в списке "Я так могу"
  useEffect(() => {
    const checkIfInMyDesigns = async () => {
      if (isMaster() && user) {
        try {
          const myDesigns = await masterService.getMasterDesigns();
          const isInList = myDesigns.some((masterDesign: any) => 
            masterDesign.nailDesign?.id === design.id
          );
          setIsInMyDesigns(isInList);
        } catch (error) {
          console.error('Ошибка проверки дизайна в списке:', error);
        }
      }
    };

    checkIfInMyDesigns();
  }, [design.id, isMaster, user]);

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

  const handleAddToServices = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user || !isMaster()) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему как мастер, чтобы добавить дизайн в свои услуги",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingToServices(true);
      
      // Добавляем дизайн в список "Я так могу"
      await masterService.addCanDoDesign(design.id, {
        customPrice: design.estimatedPrice || 0,
        notes: `Дизайн: ${design.title}`,
        estimatedDuration: 60 // базовое время выполнения
      });

      toast({
        title: "Дизайн добавлен!",
        description: `"${design.title}" добавлен в ваш список услуг`,
        variant: "default"
      });
      
      // Обновляем состояние
      setIsInMyDesigns(true);
      
      // Вызываем callback для обновления списка
      if (onDesignAdded) {
        onDesignAdded();
      }
    } catch (error: any) {
      console.error('Ошибка добавления дизайна в услуги:', error);
      
      if (error.message?.includes('уже добавлен')) {
        toast({
          title: "Дизайн уже добавлен",
          description: "Этот дизайн уже есть в вашем списке услуг",
          variant: "destructive"
        });
        // Обновляем состояние, если дизайн уже в списке
        setIsInMyDesigns(true);
      } else {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось добавить дизайн в услуги",
          variant: "destructive"
        });
      }
    } finally {
      setIsAddingToServices(false);
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
          
          {/* Кнопка "Мастера" для клиентов */}
          {!isMaster() && (
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
          )}

          {/* Кнопка "Я так могу" для мастеров */}
          {isMaster() && !isInMyDesigns && (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleAddToServices}
              disabled={isAddingToServices}
              className={`${styles.actionButton} bg-pink-500 hover:bg-pink-600 text-white`}
            >
              {isAddingToServices ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Я так могу
            </Button>
          )}

          {/* Показываем бейдж, если дизайн уже в списке */}
          {isMaster() && isInMyDesigns && (
            <Badge variant="secondary" className={styles.actionButton}>
              <CheckCircle className="w-4 h-4 mr-1" />
              В моих услугах
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 