import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, MapPin, Clock, DollarSign, Phone, Mail, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { NailDesign, designService } from '@/services/designService';
import { MasterWithServicesForDesign, MasterServiceForDesign } from '@/types/master.types';
import { getImageUrl } from '@/utils/image.util';
import { formatRatingWithReviews } from '@/utils/rating.util';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, roundPrice } from '@/utils/format.util';
import styles from './MastersList.module.css';

interface MastersListProps {
  design: NailDesign;
  isOpen: boolean;
  onClose: () => void;
}

// Используем новые типы из master.types.ts

export const MastersList: React.FC<MastersListProps> = ({
  design,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [masters, setMasters] = useState<MasterWithServicesForDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && design) {
      loadMasters();
    }
  }, [isOpen, design]);

  const loadMasters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await designService.getMastersForDesign(design.id);
      
      if (response.success && response.data) {
        setMasters(response.data);
      } else {
        setError(response.error || 'Ошибка загрузки мастеров');
      }
    } catch (err) {
      setError('Ошибка сети');
      console.error('Ошибка загрузки мастеров:', err);
    } finally {
      setIsLoading(false);
    }
  };



  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins > 0 ? `${mins}м` : ''}`.trim();
    }
    return `${mins}м`;
  };

  const handleViewMaster = (masterId: string) => {
    navigate(`/master/${masterId}`);
    onClose();
  };

  const handleBooking = (masterId: string, serviceId?: string) => {
    if (user) {
      // Переходим к странице мастера с предвыбранным дизайном и услугой
      let url = `/master/${masterId}?design=${design.id}`;
      if (serviceId) {
        url += `&service=${serviceId}`;
      }
      navigate(url);
      onClose();
    } else {
      // Если не авторизован, перенаправляем на страницу авторизации
      navigate('/auth');
    }
  };

  const getAvatarSrc = (master: MasterWithServicesForDesign['master']) => {
    return master.avatar_url || master.avatar;
  };

  const getMasterName = (master: MasterWithServicesForDesign['master']) => {
    return master.fullName || master.name || 'Мастер';
  };

  const getMasterInitials = (master: MasterWithServicesForDesign['master']) => {
    const name = getMasterName(master);
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            Мастера для дизайна "{design.title}"
          </DialogTitle>
        </DialogHeader>

        <div className={styles.content}>
          {/* Информация о дизайне */}
          

          {/* Список мастеров */}
          <div className={styles.mastersList}>
            {isLoading && (
              <div className={styles.skeletonList}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className={styles.skeletonCard}>
                    <CardContent className={styles.skeletonContent}>
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
                <Button onClick={loadMasters} variant="outline">
                  Попробовать снова
                </Button>
              </div>
            )}

            {!isLoading && !error && masters.length === 0 && (
              <div className={styles.emptyState}>
                <p>Пока нет мастеров, которые могут выполнить этот дизайн</p>
                <Button onClick={onClose} variant="outline">
                  Закрыть
                </Button>
              </div>
            )}

            {!isLoading && !error && masters.length > 0 && (
              <div className={styles.mastersGrid}>
                {masters.map((masterWithServices) => {
                  const master = masterWithServices.master;
                  return (
                    <Card key={master.id} className={styles.masterCard}>
                      <CardContent className={styles.masterContent}>
                        {/* Аватар и основная информация */}
                        <div className={styles.masterHeader}>
                          <Avatar className={styles.avatar}>
                            <AvatarImage 
                              src={getAvatarSrc(master)} 
                              alt={getMasterName(master)}
                            />
                            <AvatarFallback>
                              {getMasterInitials(master)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={styles.masterInfo}>
                            <h4 className={styles.masterName}>
                              {getMasterName(master)}
                            </h4>
                            
                            {/* Рейтинг */}
                            <div className={styles.rating}>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className={styles.ratingText}>
                                {formatRatingWithReviews(master.rating, master.reviewsCount)}
                              </span>
                            </div>

                            {/* Адрес */}
                            {master.address && (
                              <div className={styles.location}>
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className={styles.locationText}>
                                  {master.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Специализации */}
                        {master.specialties && master.specialties.length > 0 && (
                          <div className={styles.specialties}>
                            {master.specialties.slice(0, 3).map((specialty, index) => (
                              <Badge key={index} variant="outline" className={styles.specialty}>
                                {specialty}
                              </Badge>
                            ))}
                            {master.specialties.length > 3 && (
                              <Badge variant="outline" className={styles.specialty}>
                                +{master.specialties.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Услуги мастера для этого дизайна */}
                        <div className={styles.servicesSection}>
                          <h4 className={styles.servicesTitle}>Доступные услуги:</h4>
                          {masterWithServices.services.map((service) => (
                            <div key={service.id} className={styles.serviceCard}>
                              <div className={styles.serviceHeader}>
                                <h5 className={styles.serviceName}>{service.name}</h5>
                                <div className={styles.servicePrice}>
                                  {(() => {
                                    const basePrice = Number(service.basePrice) || 0;
                                    const customPrice = Number(service.customPrice) || 0;
                                    const totalPrice = basePrice + customPrice;
                                    console.log('Service debug:', {
                                      serviceId: service.id,
                                      basePrice: service.basePrice,
                                      customPrice: service.customPrice,
                                      basePriceNum: basePrice,
                                      customPriceNum: customPrice,
                                      totalPrice,
                                      isNaN: isNaN(totalPrice)
                                    });
                                    return isNaN(totalPrice) ? 'Цена не указана' : `${totalPrice} ₽`;
                                  })()}
                                </div>
                              </div>
                              
                              <div className={styles.serviceDetails}>
                                <div className={styles.serviceInfo}>
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span>{formatDuration(service.totalDuration)}</span>
                                </div>
                                
                                
                                
                               
                              </div>

                              

                              {service.notes && (
                                <p className={styles.serviceNotes}>
                                  Примечание: {service.notes}
                                </p>
                              )}

                              
                            </div>
                          ))}
                        </div>

                        {/* Описание */}
                        {master.description && (
                          <p className={styles.masterDescription}>
                            {master.description.length > 150 
                              ? `${master.description.substring(0, 150)}...`
                              : master.description
                            }
                          </p>
                        )}

                        {/* Действия */}
                        <div className={styles.actions}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMaster(master.id)}
                            className={styles.actionButton}
                          >
                            Профиль мастера
                          </Button>
                          
                          
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 