import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, Users, Share2, Download, Flag, UserPlus, CheckCircle, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLike } from '@/hooks/useLike';
import { useToast } from '@/hooks/use-toast';
import { designService } from '@/services/designService';
import { masterService } from '@/services/masterService';
import { getImageUrl } from '@/utils/image.util';
import { roundPrice } from '@/utils/format.util';
import { MastersList } from '@/pages/designs/components/MastersList';
import styles from './TikTokStyleHome.module.css';

const TikTokStyleHome: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]); // Changed type to any[] as NailDesign is removed
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingToServices, setIsAddingToServices] = useState<string | null>(null);
  const [isInMyDesigns, setIsInMyDesigns] = useState<{ [key: string]: boolean }>({});
  const [showMastersModal, setShowMastersModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isMaster, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Загружаем дизайны
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const response = await designService.getAllDesigns({
          page: 1,
          limit: 20,
          includeOwn: true
        });
        
        if (response.success && response.data) {
          setDesigns(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки дизайнов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Проверяем, какие дизайны уже в списке "Я так могу"
  useEffect(() => {
    const checkMyDesigns = async () => {
      if (isMaster() && user) {
        try {
          const myDesigns = await masterService.getMasterDesigns();
          const inMyDesigns: { [key: string]: boolean } = {};
          
          myDesigns.forEach((masterDesign: any) => {
            if (masterDesign.nailDesign?.id) {
              inMyDesigns[masterDesign.nailDesign.id] = true;
            }
          });
          
          setIsInMyDesigns(inMyDesigns);
        } catch (error) {
          console.error('Ошибка проверки дизайнов:', error);
        }
      }
    };

    checkMyDesigns();
  }, [isMaster, user]);

  // Обработка скролла
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const cardHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / cardHeight);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < designs.length) {
        setCurrentIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, designs.length]);

  // Хук для лайков
  const { isLiked, likesCount, handleLike, isLoading: isLikeLoading, canLike } = useLike({
    designId: designs[currentIndex]?.id || '',
    initialLikesCount: designs[currentIndex]?.likesCount || 0,
    initialIsLiked: designs[currentIndex]?.isLiked || false
  });

  // Добавление дизайна в "Я так могу"
  const handleAddToServices = async (designId: string) => {
    if (!user || !isMaster()) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему как мастер, чтобы добавить дизайн в свои услуги",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingToServices(designId);
      
      const design = designs.find(d => d.id === designId);
      if (!design) return;

      await masterService.addCanDoDesign(designId, {
        customPrice: design.estimatedPrice || 0,
        notes: `Дизайн: ${design.title}`,
        estimatedDuration: 60
      });

      toast({
        title: "Дизайн добавлен!",
        description: `"${design.title}" добавлен в ваш список услуг`,
        variant: "default"
      });
      
      setIsInMyDesigns(prev => ({ ...prev, [designId]: true }));
    } catch (error: any) {
      console.error('Ошибка добавления дизайна в услуги:', error);
      
      if (error.message?.includes('уже добавлен')) {
        toast({
          title: "Дизайн уже добавлен",
          description: "Этот дизайн уже есть в вашем списке услуг",
          variant: "destructive"
        });
        setIsInMyDesigns(prev => ({ ...prev, [designId]: true }));
      } else {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось добавить дизайн в услуги",
          variant: "destructive"
        });
      }
    } finally {
      setIsAddingToServices(null);
    }
  };

  // Переход к детальному просмотру
  const handleViewDetails = (designId: string) => {
    navigate(`/designs/${designId}`);
  };

  // Поиск мастеров
  const handleFindMasters = (design: any) => {
    setSelectedDesign(design);
    setShowMastersModal(true);
  };

  // Навигация по карточкам
  const scrollToCard = (direction: 'up' | 'down') => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const cardHeight = container.clientHeight;
    const currentScrollTop = container.scrollTop;
    
    if (direction === 'up' && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      container.scrollTo({
        top: newIndex * cardHeight,
        behavior: 'smooth'
      });
      setCurrentIndex(newIndex);
    } else if (direction === 'down' && currentIndex < designs.length - 1) {
      const newIndex = currentIndex + 1;
      container.scrollTo({
        top: newIndex * cardHeight,
        behavior: 'smooth'
      });
      setCurrentIndex(newIndex);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Дизайны не найдены</h2>
          <p className="text-muted-foreground">Попробуйте позже</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background relative">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory md:pb-0 pb-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {designs.map((design, index) => (
          <div
            key={design.id}
            className="h-full snap-start flex items-center justify-center p-4 md:p-4 p-0"
          >
            <div className="flex items-center gap-3">
              {/* Карточка дизайна */}
              <Card className={`${styles.designCard} relative overflow-hidden`}>
                {/* Изображение дизайна */}
                <div className={styles.imageContainer}>
                  <img
                    src={getImageUrl(design.imageUrl) || '/placeholder.svg'}
                    alt={design.title}
                    className={styles.image}
                  />
                  
                  {/* Градиентный оверлей */}
                  <div className={styles.overlay} />
                  
                  {/* Информация о дизайне */}
                  <div className={styles.content}>
                    <div className={styles.header}>
                      <h2 className={styles.title}>{design.title}</h2>
                      <Badge 
                        variant={design.type === 'designer' ? 'default' : 'secondary'}
                        className={styles.typeBadge}
                      >
                        {design.type === 'designer' ? 'Дизайнерский' : 'Базовый'}
                      </Badge>
                    </div>
                    
                    {design.description && (
                      <p className={styles.description}>{design.description}</p>
                    )}
                    
                    {/* Статистика */}
                    <div className={styles.stats}>
                      <div className={styles.stat}>
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{design.likesCount}</span>
                      </div>
                      <div className={styles.stat}>
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>{design.ordersCount}</span>
                      </div>
                      {design.estimatedPrice && (
                        <div className={styles.stat}>
                          <span className="font-semibold text-primary">
                            {roundPrice(design.estimatedPrice)}₽
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Теги дизайна */}
                    {design.tags && design.tags.length > 0 && (
                      <div className={styles.tags}>
                        {design.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className={styles.tag}
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {design.tags.length > 3 && (
                          <Badge variant="outline" className={styles.tag}>
                            +{design.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Цвет дизайна */}
                    {design.color && (
                      <div className={styles.colorInfo}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: design.color }}
                          title={design.color}
                        />
                        <span className={styles.colorText}>{design.color}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Кнопка "Подробнее" внизу (только на десктопе) */}
                  <div className={`${styles.bottomActions} md:block hidden`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(design.id)}
                      className={styles.detailsButton}
                    >
                      Подробнее
                    </Button>
                  </div>

                  {/* Мобильные кнопки действий */}
                  <div className={`${styles.mobileActions} md:hidden`}>
                    {/* Подробнее (первая кнопка) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(design.id)}
                      className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
                    >
                      <Eye className="w-6 h-6" />
                    </Button>

                    {/* Лайк */}
                    {canLike && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLike}
                        disabled={isLikeLoading}
                        className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
                      >
                        <Heart 
                          className={`w-6 h-6 ${isLiked ? 'fill-current text-red-500' : ''}`}
                        />
                      </Button>
                    )}
                    
                    {/* Поиск мастеров (только для клиентов) */}
                    {!isMaster() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFindMasters(design)}
                        className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
                      >
                        <Users className="w-6 h-6" />
                      </Button>
                    )}
                    
                    {/* Я так могу (только для мастеров) */}
                    {isMaster() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddToServices(design.id)}
                        disabled={isAddingToServices === design.id}
                        className={`w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg ${isInMyDesigns[design.id] ? 'text-green-500' : ''}`}
                      >
                        {isAddingToServices === design.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <CheckCircle className="w-6 h-6" />
                        )}
                      </Button>
                    )}
                    
                    {/* Поделиться */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.share?.({
                          title: design.title,
                          text: `Посмотрите этот дизайн ногтей: ${design.title}`,
                          url: window.location.href
                        });
                      }}
                      className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
                    >
                      <Share2 className="w-6 h-6" />
                    </Button>
                    
                    {/* Сохранить */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getImageUrl(design.imageUrl) || design.imageUrl;
                        link.download = `${design.title}.jpg`;
                        link.click();
                      }}
                      className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
                    >
                      <Download className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Кнопки действий справа от карточки */}
              <div className={styles.sideActions}>
                {/* Лайк */}
                {canLike && (
                  <div className={styles.actionItem}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLike}
                      disabled={isLikeLoading}
                      className={styles.sideActionButton}
                    >
                      <Heart 
                        className={`w-6 h-6 ${isLiked ? 'fill-current text-red-500' : ''}`}
                      />
                    </Button>
                    <span className={styles.actionLabel}>Лайк</span>
                  </div>
                )}
                
                {/* Поиск мастеров (только для клиентов) */}
                {!isMaster() && (
                  <div className={styles.actionItem}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFindMasters(design)}
                      className={styles.sideActionButton}
                    >
                      <Users className="w-6 h-6" />
                    </Button>
                    <span className={styles.actionLabel}>Мастера</span>
                  </div>
                )}
                
                {/* Я так могу (только для мастеров) */}
                {isMaster() && (
                  <div className={styles.actionItem}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddToServices(design.id)}
                      disabled={isAddingToServices === design.id}
                      className={`${styles.sideActionButton} ${isInMyDesigns[design.id] ? styles.addedButton : ''}`}
                    >
                      {isAddingToServices === design.id ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <CheckCircle className="w-6 h-6" />
                      )}
                    </Button>
                    <span className={styles.actionLabel}>
                      {isInMyDesigns[design.id] ? 'Добавлено' : 'Я так могу'}
                    </span>
                  </div>
                )}
                
                {/* Поделиться */}
                <div className={styles.actionItem}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.share?.({
                        title: design.title,
                        text: `Посмотрите этот дизайн ногтей: ${design.title}`,
                        url: window.location.href
                      });
                    }}
                    className={styles.sideActionButton}
                  >
                    <Share2 className="w-6 h-6" />
                  </Button>
                  <span className={styles.actionLabel}>Поделиться</span>
                </div>
                
                {/* Сохранить */}
                <div className={styles.actionItem}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = getImageUrl(design.imageUrl) || design.imageUrl;
                      link.download = `${design.title}.jpg`;
                      link.click();
                    }}
                    className={styles.sideActionButton}
                  >
                    <Download className="w-6 h-6" />
                  </Button>
                  <span className={styles.actionLabel}>Скачать</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопки навигации у правой границы */}
      <div className={styles.navigationButtons}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollToCard('up')}
          disabled={currentIndex === 0}
          className={styles.navButton}
        >
          <ChevronUp className="w-10 h-10" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollToCard('down')}
          disabled={currentIndex === designs.length - 1}
          className={styles.navButton}
        >
          <ChevronDown className="w-10 h-10" />
        </Button>
      </div>

      {/* Модалка выбора мастеров */}
      {selectedDesign && (
        <MastersList
          design={selectedDesign}
          isOpen={showMastersModal}
          onClose={() => {
            setShowMastersModal(false);
            setSelectedDesign(null);
          }}
        />
      )}
    </div>
  );
};

export default TikTokStyleHome; 