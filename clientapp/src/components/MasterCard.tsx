import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, Star, MapPin, Play, MessageCircle, Eye, Video, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Master } from "@/data/mockMasters";
import { ReviewsModal } from "./ReviewsModal";
import { CommentsModal } from "./CommentsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/utils/format.util";

interface MasterCardProps {
  master: Master;
  onSelect: (master: Master) => void;
  onSwipe?: (direction: 'up' | 'down') => void;
  isMobile?: boolean;
}

export const MasterCard = ({ master, onSelect, onSwipe, isMobile = false }: MasterCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(master.likes);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { user, isClient, isGuest } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (videoRef.current) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing video:', error);
        }
      };

      if (isPlaying) {
        playVideo();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const { y } = dragOffset;
    const threshold = 100;
    
    if (Math.abs(y) > threshold && onSwipe) {
      onSwipe(y > 0 ? 'down' : 'up');
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMasterClick = () => {
    onSelect(master);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (master.videoUrl) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isClient()) {
      if (isGuest()) {
        toast({
          title: "Требуется регистрация",
          description: "Зарегистрируйтесь как клиент, чтобы ставить лайки",
          variant: "destructive"
        });
      } else if (user && 'role' in user && user.role === 'nailmaster') {
        toast({
          title: "Недоступно для мастеров",
          description: "Лайки доступны только для клиентов",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему как клиент, чтобы ставить лайки",
          variant: "destructive"
        });
      }
      return;
    }
    
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isClient()) {
      if (isGuest()) {
        toast({
          title: "Требуется регистрация",
          description: "Зарегистрируйтесь как клиент, чтобы записаться к мастеру",
          variant: "destructive"
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
          description: "Войдите в систему как клиент, чтобы записаться",
          variant: "destructive"
        });
      }
      return;
    }
    
    console.log('Booking clicked for:', master.name);
  };

  const handleComments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCommentsOpen(true);
  };

  const handleReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReviewsOpen(true);
  };

  const handleAuthPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/auth');
  };

  const renderLikeButton = () => {
    if (isClient()) {
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLike}
          className="text-white hover:bg-white/20"
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      );
    } else {
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAuthPrompt}
          className="text-white hover:bg-white/20"
        >
          <UserPlus className="w-6 h-6" />
        </Button>
      );
    }
  };

  const renderBookingButton = (isFullWidth = false) => {
    if (isClient()) {
      return (
        <Button
          size={isFullWidth ? "default" : "sm"}
          variant={isFullWidth ? "default" : "ghost"}
          onClick={handleBooking}
          className={isFullWidth ? "w-full gradient-bg text-white font-semibold rounded-full" : "text-white hover:bg-white/20"}
        >
          {isFullWidth ? (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Записаться
            </>
          ) : (
            <Calendar className="w-6 h-6" />
          )}
        </Button>
      );
    } else {
      return (
        <Button
          size={isFullWidth ? "default" : "sm"}
          variant="outline"
          onClick={handleAuthPrompt}
          className={isFullWidth ? "w-full bg-white/20 text-white border-white/30 hover:bg-white/30" : "text-white hover:bg-white/20"}
        >
          {isFullWidth ? (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Войти для записи
            </>
          ) : (
            <UserPlus className="w-6 h-6" />
          )}
        </Button>
      );
    }
  };

  const transform = isDragging && isMobile
    ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.y * 0.1}deg)`
    : '';

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-b from-transparent to-black/80 cursor-pointer ${isMobile ? 'touch-manipulation' : ''}`}
      onClick={handleMasterClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {master.isVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={master.videoUrl || master.image}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onClick={handleVideoClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleVideoClick}
                >
                  <Play className="w-8 h-8 fill-white" />
                </Button>
              </div>
            )}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/50 rounded-full p-2">
                <Video className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={master.image}
            alt={master.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
        {/* Mobile Layout */}
        {isMobile ? (
          <>
            {/* Боковая панель действий */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-40">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={master.avatar} />
                <AvatarFallback>{master.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center">
                {renderLikeButton()}
                <span className="text-white text-xs mt-1 font-medium">{likesCount}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                  onClick={handleComments}
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <span className="text-white text-xs mt-1 font-medium">23</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                  onClick={handleReviews}
                >
                  <Star className="w-6 h-6" />
                </Button>
                <span className="text-white text-xs mt-1 font-medium">{master.rating}</span>
              </div>
            </div>

            {/* Информация о мастере */}
            <div className="absolute bottom-0 left-0 right-16 p-4 text-white z-10">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{master.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{master.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{master.location}</span>
                <span className="text-sm font-semibold">{formatPrice(master.price || 0)}</span>
              </div>
              
              <p className="text-sm mb-3 opacity-90 line-clamp-2">{master.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {master.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              {renderBookingButton(true)}
            </div>
          </>
        ) : (
          /* Desktop Layout */
          <>
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={master.avatar} />
                  <AvatarFallback>{master.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-white text-lg">{master.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm">{master.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {renderLikeButton()}
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                  onClick={handleComments}
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                  onClick={handleReviews}
                >
                  <Star className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{master.location}</span>
                <span className="text-sm font-semibold">{formatPrice(master.price || 0)}</span>
                <span className="text-sm">• {likesCount} лайков</span>
              </div>
              
              <p className="text-sm mb-3 opacity-90">{master.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {master.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className="w-full gradient-bg text-white font-semibold rounded-full"
                onClick={handleBooking}
              >
                Записаться
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ReviewsModal 
        isOpen={isReviewsOpen} 
        onClose={() => setIsReviewsOpen(false)} 
        masterName={master.name}
      />
      
      <CommentsModal 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        masterName={master.name}
      />
    </div>
  );
};

export default MasterCard;
