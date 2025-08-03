import { useState, useEffect } from "react";
import { ArrowLeft, Heart, MessageCircle, Share, MapPin, Star, Clock, Phone, Instagram, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewsModal } from "../ReviewsModal";
import BookingModal from "../BookingModal";
import { PhotoGalleryModal } from "../PhotoGalleryModal";
import { MasterProfile } from "@/types/user.types";
import { masterService } from "@/services/masterService";
import { MasterService, MasterServiceDesign } from "@/types/master.types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/image.util";
import GuestModeNotification from "../GuestModeNotification";
import ServiceDesigns from "./ServiceDesigns";
import MasterDesigns from "./MasterDesigns";
import { NailDesign } from "@/services/designService";
import { masterRating } from "@/types/master-rating.type";
import { masterRatingService } from "@/services/master-rating.service";
import MasterAvailability from "./MasterAvailability";

interface MobileProfileViewProps {
  master: MasterProfile;
  onBack: () => void;
}



const MobileProfileView = ({ master, onBack }: MobileProfileViewProps) => {
  const { isAuthenticated, isClient, isGuest } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [services, setServices] = useState<MasterService[]>([]);
  const [ratings, setRatings] = useState<masterRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<MasterService | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<NailDesign | MasterServiceDesign | null>(null);

  const fetchMasterRatings = async () => {
    try {
      if (!master.id) {
        console.error('ID мастера не найден');
        return;
      }
      const masterRatingsData = await masterRatingService.getMasterRatingById(master.id);
      console.log('master ratings (mobile):', masterRatingsData);
      setRatings(masterRatingsData);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  }

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!master.id) {
          console.error('ID мастера не найден');
          return;
        }
        const servicesData = await masterService.getMasterServices(master.id);
        setServices(servicesData);
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        toast.error('Не удалось загрузить услуги мастера');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
    fetchMasterRatings();
  }, [master.id]);

  // Функция для обновления отзывов после добавления нового
  const handleReviewsUpdate = async () => {
    console.log('Обновление отзывов в MobileProfileView');
    await fetchMasterRatings();
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  const handleServiceSelect = (service: MasterService) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  const handleDesignClick = (design: NailDesign | MasterServiceDesign) => {
    setSelectedDesign(design);
    setShowGallery(true);
  };

  const handleBookingClick = () => {
    console.log('handleBookingClick вызван (Mobile)');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isClient():', isClient());
    console.log('isGuest():', isGuest());
    
    if (!isAuthenticated) {
      console.log('Пользователь не авторизован');
      toast.error("Для записи необходимо войти в систему");
      return;
    }
    
    if (!isClient() && !isGuest()) {
      console.log('Пользователь не клиент и не гость');
      toast.error("Записаться могут только клиенты");
      return;
    }
    
    console.log('Открываем модалку записи');
    setShowBooking(true);
  };

  // Эта функция больше не нужна, так как передаем услугу напрямую

  // Определяем, показывать ли кнопки записи
  const canBook = !isAuthenticated || isClient() || isGuest();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{master.name || master.fullName}</h1>
          <Button variant="ghost" size="icon">
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Уведомление для гостей */}
        {isGuest() && (
          <div className="p-4">
            <GuestModeNotification />
          </div>
        )}
        
        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <SmartAvatar 
              src={master.avatar_url || master.avatar} 
              alt={master.name || master.fullName}
              fallback={(master.name || master.fullName || '?')[0]}
              className="w-20 h-20 text-xl"
            />
            
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{master.name || master.fullName}</h2>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{master.rating || 0}</span>
                <button 
                  onClick={() => setShowReviews(true)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  • {master.reviewsCount || 0} отзывов
                </button>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{master.location || master.address}</span>
              </div>
              
              <div className="flex gap-2">
                {canBook && (
                  <Button 
                    size="sm" 
                    className="gradient-bg text-white"
                    onClick={handleBookingClick}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Записаться
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {master.description || "Профессиональный мастер маникюра с многолетним опытом. Специализируюсь на авторском дизайне и работе с премиальными материалами. Каждый клиент для меня особенный! ✨"}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {master.specialties?.map((specialty) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <MasterAvailability masterId={master.id} />
            <div className="flex items-center gap-1">
              <Instagram className="w-4 h-4" />
              <span>@{(master.name || master.fullName || '').toLowerCase().replace(' ', '_')}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Reviews Summary */}
        <div className="p-6">
          <button 
            onClick={() => setShowReviews(true)}
            className="w-full text-left hover:bg-accent p-3 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Отзывы</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{master.rating || 0}</span>
                </div>
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{master.reviewsCount || 0}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              "Потрясающий мастер! Делала у {(master.name || master.fullName || '').split(' ')[0]} дизайн с градиентом..."
            </p>
          </button>
        </div>

        <Separator />

        {/* Services */}
        <div className="p-6">
          <h3 className="font-semibold mb-4">Услуги и цены</h3>
          <div className="space-y-4">
            {isLoading ? (
              // Скелетон для загрузки
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="p-4 bg-card border border-border animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </Card>
              ))
            ) : services.length > 0 ? (
              services.map((service) => (
                <Card key={service.id} className="p-4 bg-card border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium mb-1">{service.name}</h4>
                      {service.description && (
                        <p className="text-xs text-muted-foreground mb-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} мин</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{service.price}₽</p>
                      {canBook && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => handleServiceSelect(service)}
                        >
                          Выбрать
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Дизайны для услуги */}
                  <ServiceDesigns 
                    serviceId={service.id} 
                    serviceName={service.name}
                    onDesignClick={handleDesignClick}
                  />
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Услуги не найдены
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Master Designs */}
        <div className="p-6">
          <MasterDesigns 
            masterId={master.id} 
            onDesignClick={handleDesignClick}
          />
        </div>

        {/* Bottom CTA */}
        {canBook && (
          <div className="sticky bottom-0 bg-background border-t border-border p-4">
            <Button 
              className="w-full gradient-bg text-white font-semibold tiktok-shadow"
              onClick={handleBookingClick}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Записаться на {formatPrice(master.price || 0)}
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReviewsModal 
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        master={master}
        onReviewsUpdate={handleReviewsUpdate}
      />
      
      <BookingModal
        isOpen={showBooking}
        onClose={() => {
          setShowBooking(false);
          setSelectedService(null);
        }}
        service={selectedService}
        masterId={master.id}
      />

      {selectedDesign && (
        <PhotoGalleryModal
          isOpen={showGallery}
          onClose={() => {
            setShowGallery(false);
            setSelectedDesign(null);
          }}
          images={[
            'nailDesign' in selectedDesign 
                              ? getImageUrl(selectedDesign.nailDesign.imageUrl) || '/placeholder.svg'
                : getImageUrl(selectedDesign.imageUrl) || '/placeholder.svg'
          ]}
          initialIndex={0}
        />
      )}
    </div>
  );
};

export default MobileProfileView;
