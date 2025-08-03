
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Palette, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Секция призыва к действию
 * Современный дизайн с акцентом на функциональность
 */
const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-pink-50 via-violet-50 to-pink-50 dark:from-pink-950/20 dark:via-violet-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
              Начните прямо сейчас
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Присоединяйтесь к тысячам мастеров и клиентов, которые уже используют нашу платформу
            </p>
          </div>
          
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            <div className="flex flex-col items-center space-y-2">
              <Users className="w-8 h-8 text-pink-500" />
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">Проверенных мастеров</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Palette className="w-8 h-8 text-violet-500" />
              <div className="text-2xl font-bold">5000+</div>
              <div className="text-sm text-muted-foreground">Уникальных дизайнов</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Средний рейтинг</div>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gradient-bg text-white px-8 py-3 text-base font-medium hover:scale-105 transition-transform" 
              onClick={() => navigate("/auth")}
            >
              Найти мастера
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3 text-base font-medium hover:bg-pink-50 dark:hover:bg-pink-950/20" 
              onClick={() => navigate("/auth")}
            >
              Стать мастером
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
