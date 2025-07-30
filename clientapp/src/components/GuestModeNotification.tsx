import { useState } from "react";
import { UserPlus, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import ConvertGuestModal from "./ConvertGuestModal";

interface GuestModeNotificationProps {
  onDismiss?: () => void;
  showOnBookingAttempt?: boolean;
}

/**
 * Компонент уведомления для гостевых пользователей
 * Показывает предложение зарегистрироваться для полного доступа к функциям
 */
const GuestModeNotification = ({ onDismiss, showOnBookingAttempt = false }: GuestModeNotificationProps) => {
  const { isGuest, getGuestSessionTimeLeft } = useAuth();
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSessionInfo, setShowSessionInfo] = useState(false);

  if (!isGuest() || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleRegisterClick = () => {
    setShowConvertModal(true);
  };

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  const timeLeft = getGuestSessionTimeLeft();

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {showOnBookingAttempt ? "Для записи нужна регистрация" : "Гостевой режим"}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {showOnBookingAttempt 
                  ? "Зарегистрируйтесь, чтобы записаться к мастеру и отслеживать свои заказы"
                  : "Зарегистрируйтесь, чтобы сохранять избранное, оставлять отзывы и записываться к мастерам"
                }
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Зарегистрироваться
                </Button>
                {!showOnBookingAttempt && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleDismiss}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/30"
                  >
                    Позже
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSessionInfo(!showSessionInfo)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/30"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
              
              {showSessionInfo && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                    <strong>Время жизни сессии:</strong> {formatTimeLeft(timeLeft)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Ваши данные хранятся локально и будут автоматически удалены по истечении времени
                  </p>
                </div>
              )}
            </div>
          </div>
          {!showOnBookingAttempt && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/30"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      <ConvertGuestModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
      />
    </>
  );
};

export default GuestModeNotification;
