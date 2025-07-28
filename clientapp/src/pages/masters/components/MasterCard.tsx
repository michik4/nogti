import React from 'react';
import { Master } from '@/types/user.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SmartAvatar } from '@/components/ui/smart-avatar';
import { Star, MapPin, Clock, Palette, Scissors } from 'lucide-react';
import styles from './MasterCard.module.css';

interface MasterCardProps {
  master: Master;
  onClick: () => void;
}

const MasterCard: React.FC<MasterCardProps> = ({ master, onClick }) => {
  const displayName = master.fullName || master.username || 'Мастер';
  const displayRating = Number(master.rating) || 0;
  const displayReviews = master.reviewsCount || 0;
  const displayLocation = master.address || 'Не указано';
  const displaySpecialties = master.specialties || [];
  const displayExperience = master.experience || 'Не указан';

  return (
    <Card className={styles.masterCard} onClick={onClick}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.masterInfo}>
          <SmartAvatar 
            src={master.avatar} 
            alt={displayName}
            fallback={displayName.charAt(0).toUpperCase()}
            className={styles.avatar}
          />
          
          <div className={styles.masterDetails}>
            <h3 className={styles.masterName}>{displayName}</h3>
            
            <div className={styles.rating}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className={styles.ratingValue}>{displayRating.toFixed(1)}</span>
              <span className={styles.reviewsCount}>({displayReviews})</span>
            </div>
            
            <div className={styles.location}>
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{displayLocation}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={styles.cardContent}>
        {/* Опыт */}
        <div className={styles.experience}>
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>Опыт: {displayExperience}</span>
        </div>
        
        {/* Специальности */}
        {displaySpecialties.length > 0 && (
          <div className={styles.specialties}>
            <div className={styles.specialtiesHeader}>
              <Scissors className="w-4 h-4 text-muted-foreground" />
              <span>Специальности:</span>
            </div>
            <div className={styles.specialtiesList}>
              {displaySpecialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className={styles.specialtyBadge}>
                  {specialty}
                </Badge>
              ))}
              {displaySpecialties.length > 3 && (
                <Badge variant="outline" className={styles.moreBadge}>
                  +{displaySpecialties.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Описание */}
        {master.description && (
          <div className={styles.description}>
            <p className={styles.descriptionText}>
              {master.description.length > 100 
                ? `${master.description.substring(0, 100)}...` 
                : master.description
              }
            </p>
          </div>
        )}
        
        {/* Статистика */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span>Дизайны</span>
            <span className={styles.statValue}>{master.designs || 0}</span>
          </div>
          
          <div className={styles.statItem}>
            <Scissors className="w-4 h-4 text-muted-foreground" />
            <span>Услуги</span>
            <span className={styles.statValue}>{master.uploadsCount || 0}</span>
          </div>
        </div>
        
        {/* Статус активности */}
        <div className={styles.status}>
          <Badge 
            variant="default"
            className={styles.statusBadge}
          >
            Доступен для записи
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterCard; 