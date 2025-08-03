import { useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Share, MapPin, Star, Clock, Phone, Instagram, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewsModal } from "./ReviewsModal";
import BookingModal from "./BookingModal";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { Master } from "@/data/mockMasters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import MasterAvailability from "./master-profile/MasterAvailability";
import { toast } from "sonner";

interface MasterProfileProps {
  master: Master;
  onBack: () => void;
}

const workImages = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1617625802596-705b0c5308da?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop"
];

const services = [
  { name: "Классический маникюр", price: "1500₽", duration: "60 мин" },
  { name: "Покрытие гель-лак", price: "2000₽", duration: "90 мин" },
  { name: "Дизайн ногтей", price: "500₽", duration: "30 мин" },
  { name: "Френч", price: "2200₽", duration: "90 мин" },
  { name: "Омбре", price: "2500₽", duration: "120 мин" },
];

const MasterProfile = ({ master, onBack }: MasterProfileProps) => {
  const { isAuthenticated, isClient, isGuest } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isMobile = useIsMobile();

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      toast.error("Для записи необходимо войти в систему");
      return;
    }
    
    if (!isClient() && !isGuest()) {
      toast.error("Записаться могут только клиенты");
      return;
    }
    
    setShowBooking(true);
  };

  // Create a design object from the first service for booking
  const createDesignFromService = (service: typeof services[0]) => ({
    id: "service-" + service.name.toLowerCase().replace(/\s+/g, '-'),
    title: service.name,
    image: workImages[0], // Use first work image as placeholder
    category: "Услуга",
    difficulty: "Любой уровень",
    price: service.price,
    duration: service.duration,
    masterName: master.name,
    masterAvatar: master.avatar,
    masterRating: master.rating
  });

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
          <h1 className="font-semibold">{master.name}</h1>
          <Button variant="ghost" size="icon">
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {isMobile ? (
        /* Mobile Layout - оставляем как есть с добавлением проверок */
        <div className="max-w-md mx-auto">
          {/* Profile Info */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={master.avatar} />
                <AvatarFallback className="text-xl">{master.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{master.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{master.rating}</span>
                  <button 
                    onClick={() => setShowReviews(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    • 127 отзывов
                  </button>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{master.location}</span>
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
              Профессиональный мастер маникюра с 5-летним опытом. Специализируюсь на авторском дизайне и работе с премиальными материалами. Каждый клиент для меня особенный! ✨
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {master.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <MasterAvailability masterId={master.id} />
              <div className="flex items-center gap-1">
                <Instagram className="w-4 h-4" />
                <span>@{master.name.toLowerCase().replace(' ', '_')}</span>
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
                    <span className="font-semibold">{master.rating}</span>
                  </div>
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">127</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "Потрясающий мастер! Делала у Анны дизайн с градиентом..."
              </p>
            </button>
          </div>

          <Separator />

          {/* Services */}
          <div className="p-6">
            <h3 className="font-semibold mb-4">Услуги и цены</h3>
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index} className="p-4 bg-card border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium mb-1">{service.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{service.price}</p>
                      {canBook && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={handleBookingClick}
                        >
                          Выбрать
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Work Gallery */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Работы</h3>
              <span className="text-sm text-muted-foreground">{workImages.length} фото</span>
            </div>
            
            <div className="instagram-grid">
              {workImages.map((image, index) => (
                <div 
                  key={index} 
                  className="aspect-square relative overflow-hidden rounded-sm cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <img 
                    src={image} 
                    alt={`Работа ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          {canBook && (
            <div className="sticky bottom-0 bg-background border-t border-border p-4">
              <Button 
                className="w-full gradient-bg text-white font-semibold tiktok-shadow"
                onClick={handleBookingClick}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Записаться на {master.price}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - горизонтальный дизайн с проверками */
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-12 gap-8 mt-6">
            {/* Left Column - Main Info */}
            <div className="col-span-4">
              <div className="sticky top-24">
                <div className="flex items-start gap-6 mb-6">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={master.avatar} />
                    <AvatarFallback className="text-2xl">{master.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">{master.name}</h2>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{master.rating}</span>
                      </div>
                      <button 
                        onClick={() => setShowReviews(true)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        • 127 отзывов
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span>{master.location}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      {canBook && (
                        <Button 
                          className="gradient-bg text-white"
                          onClick={handleBookingClick}
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Записаться
                        </Button>
                      )}
                      <Button variant="outline">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Сообщение
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Профессиональный мастер маникюра с 5-летним опытом. Специализируюсь на авторском дизайне и работе с премиальными материалами. Каждый клиент для меня особенный! ✨
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {master.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-sm">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Сегодня до 20:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5" />
                    <span>@{master.name.toLowerCase().replace(' ', '_')}</span>
                  </div>
                </div>

                {/* Reviews Summary */}
                <Card className="p-4 mb-6">
                  <button 
                    onClick={() => setShowReviews(true)}
                    className="w-full text-left hover:bg-accent p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Отзывы</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{master.rating}</span>
                        </div>
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">127</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Потрясающий мастер! Делала у Анны дизайн с градиентом..."
                    </p>
                  </button>
                </Card>
              </div>
            </div>

            {/* Middle Column - Services */}
            <div className="col-span-4">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Услуги и цены</h3>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <Card key={index} className="p-6 bg-card border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-primary mb-3">{service.price}</p>
                          {canBook && (
                            <Button 
                              variant="outline" 
                              onClick={handleBookingClick}
                            >
                              Выбрать
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Gallery */}
            <div className="col-span-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Работы</h3>
                  <span className="text-muted-foreground">{workImages.length} фото</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {workImages.map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square relative overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Работа ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 right-2">
                          <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA for Desktop */}
          {canBook && (
            <div className="sticky bottom-0 bg-background border-t border-border p-6 mt-8">
              <div className="max-w-md mx-auto">
                <Button 
                  className="w-full gradient-bg text-white font-semibold tiktok-shadow text-lg py-3"
                  onClick={handleBookingClick}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Записаться на {master.price}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ReviewsModal 
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        masterName={master.name}
      />
      
      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        design={createDesignFromService(services[0])}
        masterId={master.id}
      />

      <PhotoGalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        images={workImages}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
};

export default MasterProfile;
