
import { Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DesignInfoProps {
  design: {
    id: string;
    title: string;
    image: string;
    category: string;
    difficulty?: string;
    price: string;
    duration: string;
    masterName: string;
    masterAvatar?: string;
    masterRating?: number;
  };
}

/**
 * Компонент для отображения информации о выбранном дизайне
 * Показывает детали дизайна и информацию о мастере
 */
const DesignInfo = ({ design }: DesignInfoProps) => {
  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg">
      <img 
        src={design.image} 
        alt={design.title}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{design.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="w-6 h-6">
            <AvatarImage src={design.masterAvatar || "/placeholder.svg"} />
            <AvatarFallback>{design.masterName[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{design.masterName}</span>
          {design.masterRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{design.masterRating}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant={design.category === "Дизайнерский" ? "default" : "secondary"}>
            {design.category}
          </Badge>
          {design.difficulty && (
            <span className="text-sm text-muted-foreground">{design.difficulty}</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-bold text-primary">{design.price}</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {design.duration}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DesignInfo;
