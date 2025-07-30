import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Clock } from "lucide-react";
import { toast } from "sonner";

/**
 * Компонент для управления гостевой сессией
 * Автоматически создает гостевую сессию для неавторизованных пользователей
 * и предоставляет базовый функционал
 */
export const GuestSessionManager = () => {
  const { user, isAuthenticated, createGuestSession, getGuestSession, clearGuestSession, isGuest, getGuestSessionTimeLeft } = useAuth();
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Если пользователь не авторизован и нет гостевой сессии, создаем её
    if (!isAuthenticated && !user && !getGuestSession()) {
      createGuestSession();
    }
  }, [isAuthenticated, user, createGuestSession, getGuestSession]);

  // Обновляем время жизни сессии каждую минуту
  useEffect(() => {
    if (isGuest()) {
      const updateTimeLeft = () => {
        const time = getGuestSessionTimeLeft();
        setTimeLeft(time);
        
        // Если время истекло, очищаем сессию
        if (time <= 0) {
          clearGuestSession();
          toast.info("Гостевая сессия истекла");
        }
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000); // Обновляем каждую минуту

      return () => clearInterval(interval);
    }
  }, [isGuest, getGuestSessionTimeLeft, clearGuestSession]);

  // Показываем информацию о сессии только для гостевых пользователей
  if (!isGuest() || !showSessionInfo) {
    return null;
  }

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  const handleClearSession = () => {
    clearGuestSession();
    toast.success("Гостевая сессия удалена");
    setShowSessionInfo(false);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur-sm border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Гостевая сессия</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSessionInfo(false)}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Осталось: {formatTimeLeft(timeLeft)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearSession}
              className="flex-1"
            >
              Удалить сессию
            </Button>
            <Button
              size="sm"
              onClick={() => setShowSessionInfo(false)}
              className="flex-1"
            >
              Скрыть
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
