
import { useState } from "react";
import { X, Heart, MessageCircle, Share2, Calendar, Star, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface DesignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: {
    id: string;
    title: string;
    image: string;
    category: string;
    difficulty: string;
    price: string;
    duration: string;
    likes: number;
    masterName: string;
    masterAvatar: string;
    masterRating: number;
    canDo: boolean;
  } | null;
  onBooking: () => void;
  onLike: () => void;
  isLiked: boolean;
}

const DesignDetailModal = ({ 
  isOpen, 
  onClose, 
  design, 
  onBooking, 
  onLike, 
  isLiked 
}: DesignDetailModalProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: design?.title,
        text: `Посмотрите на этот дизайн маникюра: ${design?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Ссылка скопирована в буфер обмена");
    }
  };

  const handleICanDoThis = () => {
    toast.info("Функция 'Я так могу' будет доступна после авторизации мастера");
  };

  if (!design) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative">
            <img 
              src={design.image} 
              alt={design.title}
              className="w-full h-64 md:h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col">
            {/* Header */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{design.title}</h1>
                <Badge variant={design.category === "Дизайнерский" ? "default" : "secondary"} className="mt-2">
                  {design.category}
                </Badge>
              </div>

              {/* Master Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={design.masterAvatar} />
                  <AvatarFallback>{design.masterName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{design.masterName}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{design.masterRating}</span>
                    <span className="text-sm text-muted-foreground ml-2">Мастер маникюра</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Сложность</p>
                  <p className="font-medium">{design.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Длительность</p>
                  <p className="font-medium">{design.duration}</p>
                </div>
              </div>

              <div className="text-2xl font-bold text-primary">{design.price}</div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLike}
                  className={isLiked ? "text-red-500" : ""}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {design.likes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Комментарии
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Поделиться
                </Button>
              </div>

              <Separator />
            </div>

            {/* Booking Section */}
            <div className="mt-auto space-y-3">
              <Button onClick={onBooking} className="w-full" size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Записаться на маникюр
              </Button>
              
              {!design.canDo && (
                <Button 
                  variant="outline" 
                  onClick={handleICanDoThis}
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Я так могу
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignDetailModal;
