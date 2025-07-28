import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, UserPlus, Briefcase, Award, Users, Verified, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatRating } from '@/utils/rating.util';
import { getMasterName, getMasterInitials, getMasterId } from '@/utils/master.util';
import { getMasterBackground, getAccentColorForBackground } from '@/utils/background.util';
import { MasterWithServicesForDesign, MasterService, MasterServiceForDesign } from '@/types/master.types';
import ServiceCard from './ServiceCard';
import BookingModal from '@/components/BookingModal';
import styles from './MasterInfo.module.css';
import { getImageUrl } from '@/utils/image.util';

interface MasterInfoProps {
  masters: MasterWithServicesForDesign[];
  designId: string;
}

const MasterInfo: React.FC<MasterInfoProps> = ({ masters, designId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isGuest, isClient } = useAuth();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Состояние для модального окна записи
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MasterService | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleMasterClick = (masterId: string) => {
    navigate(`/master/${masterId}`);
  };

  const handleServiceBooking = (serviceId: string, serviceName: string) => {
    // Проверяем, что пользователь - клиент
    if (!isClient()) {
      if (isGuest()) {
        toast({
          title: "Требуется регистрация",
          description: `Зарегистрируйтесь как клиент, чтобы записаться на услугу "${serviceName}"`,
          variant: "destructive",
          duration: 4000
        });
      } else if (user && 'role' in user && user.role === 'nailmaster') {
        toast({
          title: "Недоступно для мастеров",
          description: "Запись доступна только для клиентов",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему как клиент, чтобы записаться на услугу",
          variant: "destructive"
        });
      }
      return;
    }

    // Находим услугу и мастера
    let targetServiceForDesign: MasterServiceForDesign | null = null;
    let targetMasterId: string | null = null;

    for (const masterWithServices of masters) {
      const service = masterWithServices.services.find(s => s.id === serviceId);
      if (service) {
        targetServiceForDesign = service;
        targetMasterId = masterWithServices.master.id;
        break;
      }
    }

    if (!targetServiceForDesign || !targetMasterId) {
      toast({
        title: "Ошибка",
        description: "Услуга не найдена",
        variant: "destructive"
      });
      return;
    }

    // Преобразуем MasterServiceForDesign в MasterService для BookingModal
    const adaptedService: MasterService = {
      id: targetServiceForDesign.id,
      name: targetServiceForDesign.name,
      description: targetServiceForDesign.description,
      price: targetServiceForDesign.totalPrice,
      duration: targetServiceForDesign.totalDuration,
      isActive: targetServiceForDesign.isActive,
      createdAt: targetServiceForDesign.createdAt,
      updatedAt: targetServiceForDesign.updatedAt
    };

    // Открываем модальное окно записи
    setSelectedService(adaptedService);
    setSelectedMasterId(targetMasterId);
    setIsBookingModalOpen(true);
  };

  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
    setSelectedMasterId(null);
  };

  const handleAuthPrompt = () => {
    navigate('/auth');
  };

  // Функции для скролла
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // примерная ширина карточки + отступы
      scrollContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      scrollContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // Обновление состояния кнопок скролла
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Эффект для отслеживания изменений скролла
  useEffect(() => {
    updateScrollButtons();
    const handleScroll = () => updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [masters]);

  const renderAuthPromptButton = () => {
    if (isGuest() || !isAuthenticated) {
      return (
        <Button
          variant="outline"
          onClick={handleAuthPrompt}
          className={styles.authButton}
          size="sm"
        >
          <UserPlus className="w-4 h-4" />
          Войти для записи
        </Button>
      );
    } else if (!isClient()) {
      return (
        <Button
          variant="outline"
          disabled
          className={styles.disabledButton}
          size="sm"
        >
          <Calendar className="w-4 h-4" />
          Только для клиентов
        </Button>
      );
    }
    return null;
  };

  if (!masters || masters.length === 0) {
    return (
      <Card className={styles.masterCard}>
        <CardHeader>
          <CardTitle className={styles.title}>Мастера</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={styles.noMasters}>
            Пока нет мастеров, специализирующихся на этом дизайне
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={styles.masterCard}>
        <CardHeader>
          <div className={styles.headerWithNavigation}>
            <CardTitle className={styles.title}>
              Мастера ({masters.length})
            </CardTitle>
            {masters.length > 1 && (
              <div className={styles.navigationButtons}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className={styles.navButton}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={styles.navButton}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className={styles.content}>
          <div 
            ref={scrollContainerRef}
            className={styles.mastersList}
          >
            {masters.map((masterWithServices) => {
              const master = masterWithServices.master;
              const activeServices = masterWithServices.services.filter(service => service.isActive);

              if (!master) {
                return null;
              }

              const backgroundStyle = getMasterBackground(master.id);
              const accentColor = getAccentColorForBackground(master.id);

              return (
                <div key={master.id} className={styles.masterCard}>
                  {/* Верхняя секция: фон слева, аватар справа */}
                  <div className={styles.masterHero} onClick={() => handleMasterClick(master.id)}>
                    {/* Фоновая часть */}
                    <div 
                      className={styles.backgroundSection}
                      style={{ background: backgroundStyle }}
                    >
                      <div className={styles.heroOverlay} />
                      
                      {/* Информация о мастере на фоне */}
                      <div className={styles.masterInfoOverlay}>
                        <div className={styles.overlayNameWrapper}>
                          <h4 className={styles.overlayName}>{getMasterName(master)}</h4>
                          {master.isModerated && (
                            <Verified className="w-3 h-3 ml-1 flex-shrink-0" style={{ color: 'hsl(var(--primary))'}} />
                          )}
                        </div>
                        <div className={styles.overlayRating}>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{formatRating(master?.rating)}</span>
                          <span className={styles.overlayReviews}>({master?.reviewsCount || 0})</span>
                        </div>
                      </div>
                      
                      {master.rating >= 4.5 && (
                        <div className={styles.topBadge}>
                          <Award className="w-3 h-3" />
                          <span>Топ</span>
                        </div>
                      )}
                    </div>

                    {/* Аватар справа */}
                    <div className={styles.avatarSection}>
                      <Avatar className={styles.flexAvatar}>
                        <AvatarImage src={getImageUrl(master.avatar_url || master.avatar)} alt={getMasterName(master)} />
                        <AvatarFallback className={styles.avatarFallback}>
                          {getMasterInitials(master)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>


                  {/* Компактная информация о мастере */}
                  <div className={styles.masterContent}>

                    {master.address && (
                      <div className={styles.masterLocation}>
                        <MapPin className="w-3 h-3" />
                        <span>{master.address}</span>
                      </div>
                    )}

                    <div className={styles.masterMeta}>
                      {master.totalOrders && master.totalOrders > 0 && (
                        <div className={styles.metaItem}>
                          <Users className="w-3 h-3" />
                          <span>{master.totalOrders}</span>
                        </div>
                      )}

                      <div className={styles.metaItem}>
                        <Briefcase className="w-3 h-3" />
                        <span>{masterWithServices.services.length}</span>
                      </div>

                      <Badge
                        variant={master.isActive ? "default" : "secondary"}
                        className={styles.statusBadge}
                        style={{ borderColor: accentColor }}
                      >
                        {master.isActive ? 'Доступен' : 'Недоступен'}
                      </Badge>
                    </div>

                    {master.specialties && master.specialties.length > 0 && (
                      <div className={styles.specialties}>
                        {master.specialties.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="outline" className={styles.specialtyBadge}>
                            {spec}
                          </Badge>
                        ))}
                        {master.specialties.length > 2 && (
                          <span className={styles.moreSpecs}>+{master.specialties.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Услуги мастера для этого дизайна */}
                  <div className={styles.masterServices}>
                    <div className={styles.servicesHeader}>
                      <div className={styles.servicesTitle}>
                        <Briefcase className="w-4 h-4" />
                        <span>Услуги ({masterWithServices.services.length})</span>
                      </div>
                    </div>

                    <div className={styles.servicesList}>
                      {activeServices.length > 0 ? (
                        activeServices.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            masterName={getMasterName(master)}
                            onBooking={handleServiceBooking}
                            showBookingButton={isClient()}
                          />
                        ))
                      ) : (
                        <div className={styles.noActiveServices}>
                          <p className="text-sm text-muted-foreground">
                            Нет доступных услуг для этого дизайна
                          </p>
                          {renderAuthPromptButton()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Модальное окно записи */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleBookingModalClose}
        service={selectedService}
        masterId={selectedMasterId || undefined}
        preselectedDesignId={designId}
      />
    </>
  );
};

export default MasterInfo; 