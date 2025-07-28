import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Wallet, Calendar, Info, Sparkles, TrendingUp } from 'lucide-react';
import { MasterServiceForDesign } from '@/types/master.types';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: MasterServiceForDesign;
  masterName: string;
  onBooking: (serviceId: string, serviceName: string) => void;
  showBookingButton?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  masterName, 
  onBooking, 
  showBookingButton = true 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins > 0 ? `${mins}м` : ''}`.trim();
    }
    return `${mins}м`;
  };

  const isPriceChanged = service.customPrice && service.customPrice !== service.basePrice;

  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceHeader}>
        <div className={styles.serviceInfo}>
          <h4 className={styles.serviceName}>{service.name}</h4>
          {service.description && (
            <p className={styles.serviceDescription}>{service.description}</p>
          )}
        </div>
        <Badge 
          variant={service.isActive ? "default" : "secondary"}
          className={styles.statusBadge}
        >
          {service.isActive ? "Доступна" : "Недоступна"}
        </Badge>
      </div>

      <div className={styles.serviceDetails}>
        <div className={styles.priceSection}>
          <div className={styles.priceInfo}>
            <Wallet className="w-4 h-4 text-green-600" />
            <div className={styles.priceText}>
              <span className={styles.currentPrice}>
                {formatPrice(service.totalPrice)}
              </span>
              {isPriceChanged && (
                <span className={styles.basePrice}>
                  от {formatPrice(service.basePrice)}
                </span>
              )}
            </div>
          </div>
          {isPriceChanged && (
            <Badge variant="outline" className={styles.customPriceBadge}>
              <Sparkles className="w-3 h-3" />
              Специальная цена
            </Badge>
          )}
        </div>

        <div className={styles.durationInfo}>
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{formatDuration(service.totalDuration)}</span>
          {service.additionalDuration && service.additionalDuration > 0 && (
            <span className={styles.additionalTime}>
              (+{formatDuration(service.additionalDuration)})
            </span>
          )}
        </div>

        {service.notes && (
          <div className={styles.notesInfo}>
            <Info className="w-4 h-4 text-orange-600" />
            <span className={styles.notes}>{service.notes}</span>
          </div>
        )}
      </div>

      {showBookingButton && service.isActive && (
        <div className={styles.actions}>
          <Button
            onClick={() => onBooking(service.id, service.name)}
            className={styles.bookingButton}
            size="sm"
          >
            <Calendar className="w-4 h-4" />
            Записаться за {formatPrice(service.totalPrice)}
            {isPriceChanged && <TrendingUp className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceCard; 