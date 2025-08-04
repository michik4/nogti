import { useState, useEffect } from "react";
import { ArrowLeft, Heart, MessageCircle, Share, MapPin, Star, Clock, Phone, Instagram, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Badge } from "@/components/ui/badge";
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
import styles from './DesktopProfileView.module.css';
import { formatCustomDate } from "@/utils/time.util";
import { formatPrice } from "@/utils/format.util";
import { ReviewsSummary } from "../ReviewsSummary";
import MasterAvailability from "./MasterAvailability";
import MasterStats from "../MasterStats";

interface DesktopProfileViewProps {
  master: MasterProfile;
  onBack: () => void;
}

const DesktopProfileView = ({ master, onBack }: DesktopProfileViewProps) => {
  const { isAuthenticated, isClient, isGuest } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Отладка состояния модалки
  console.log('DesktopProfileView - showBooking:', showBooking);
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
      console.log('master ratings:', masterRatingsData);
      setRatings(masterRatingsData);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setIsLoading(false);
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
    console.log('Обновление отзывов в DesktopProfileView');
    await fetchMasterRatings();
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  const handleDesignClick = (design: NailDesign | MasterServiceDesign) => {
    setSelectedDesign(design);
    setShowGallery(true);
  };

  const handleServiceSelect = (service: MasterService) => {
    console.log('handleServiceSelect вызван для услуги:', service);
    setSelectedService(service);
    console.log('Устанавливаем showBooking в true');
    setShowBooking(true);
  };

  const handleBookingClick = () => {
    console.log('handleBookingClick вызван');
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
    <div className="max-w-7xl mx-auto px-6">
        {/* Уведомление для гостей */}
        {isGuest() && (
          <div className="mt-6 mb-6">
            <GuestModeNotification />
          </div>
        )}

        <div className="grid grid-cols-12 gap-8 mt-6">
          {/* Left Column - Main Info */}
          <div className="col-span-4">
            <div className="sticky top-24">
              <div className="flex items-start gap-6 mb-6">
                <SmartAvatar 
                  src={master.avatar_url || master.avatar} 
                  alt={master.name || master.fullName}
                  fallback={(master.name || master.fullName || '?')[0]}
                  className="w-32 h-32 text-2xl"
                />

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{master.name || master.fullName}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{master.rating || 0}</span>
                    </div>
                    <button
                      onClick={() => setShowReviews(true)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      • {master.reviewsCount || 0} отзывов
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    {master.location && (
                      <>
                        <MapPin className="w-5 h-5" />
                        <span>{master.location || master.address}</span>
                      </>
                    )}
                    {master.address && (
                      <>
                        <MapPin className="w-5 h-5" />
                        <span>{master.address}</span>
                      </>
                    )}
                  </div>

                  
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {master.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {master.specialties?.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-muted-foreground mb-6">
                <MasterAvailability masterId={master.id} />
                
              </div>

              {/* Reviews Summary - ИНТЕГРАЦИЯ НОВОГО КОМПОНЕНТА */}
              <ReviewsSummary
                isLoading={isLoading}
                ratings={ratings}
                totalReviews={ratings.length}
                onShowAll={() => setShowReviews(true)}
                master={master}
                onReviewsUpdate={handleReviewsUpdate}
              />

              {/* Статистика мастера */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Статистика</h3>
                <MasterStats
                  master={{
                    id: master.id,
                    fullName: master.fullName || master.username,
                    rating: master.rating,
                    reviewsCount: ratings.length,
                    totalOrders: 0, // Будет добавлено позже
                    completedOrders: 0, // Будет добавлено позже
                    pendingOrders: 0, // Будет добавлено позже
                    averageOrderPrice: 0, // Будет добавлено позже
                    totalEarnings: 0, // Будет добавлено позже
                    experienceYears: 0, // Будет добавлено позже
                    specializations: master.specialties
                  }}
                />
              </div>
            
            </div>
          </div>

          {/* Middle Column - Services */}
          <div className="col-span-4">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Услуги и цены</h3>
              <div className="space-y-4">
                {isLoading ? (
                  // Скелетон для загрузки
                  Array(3).fill(0).map((_, index) => (
                    <Card key={index} className="p-6 bg-card border border-border animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </Card>
                  ))
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <Card key={service.id} className="p-6 bg-card border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} мин</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-primary mb-3">{formatPrice(service.price)}</p>
                          {canBook && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                console.log('Кнопка "Выбрать" нажата для услуги:', service.name);
                                handleServiceSelect(service);
                              }}
                              disabled={false}
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
          </div>

          {/* Right Column - Master Designs */}
          <div className="col-span-4">
            <MasterDesigns
              masterId={master.id}
              onDesignClick={handleDesignClick}
            />
          </div>
        </div>

        {/* Bottom CTA for Desktop */}
        

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

export default DesktopProfileView;
