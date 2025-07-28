import { useState } from "react";
import { Search, User, Calendar, Users, Palette, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Главная секция домашней страницы
 * Включает заголовок, описание, поиск и основные кнопки действий
 * Адаптируется под роль пользователя
 */
const HeroSection = () => {
  const navigate = useNavigate();
  const { user, createGuestSession, isClient, isMaster, isAdmin, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Обработчик входа в гостевой режим
  const handleTryAsGuest = () => {
    createGuestSession();
    // Страница автоматически обновится через контекст
  };

  // Получаем персонализированный контент в зависимости от пользователя
  const getPersonalizedContent = () => {
    if (!user) {
      // Неавторизованный пользователь
      return {
        title: "NailMasters",
        subtitle: "Найдите лучшего мастера маникюра в вашем городе и запишитесь онлайн",
        searchPlaceholder: "Поиск мастера или услуги...",
        buttons: [
          {
            text: "Найти мастера",
            variant: "default" as const,
            className: "gradient-bg text-white",
            icon: null,
            action: () => navigate("/auth")
          },
          {
            text: "Стать мастером", 
            variant: "outline" as const,
            className: "",
            icon: null,
            action: () => navigate("/auth")
          },
          {
            text: "Попробовать как гость",
            variant: "secondary" as const,
            className: "",
            icon: User,
            action: handleTryAsGuest
          }
        ]
      };
    }

    if (isGuest()) {
      // Гостевой пользователь
      const guestUser = user as any;
      return {
        title: `Добро пожаловать, ${guestUser.name}!`,
        subtitle: "Вы находитесь в гостевом режиме. Зарегистрируйтесь для полного функционала",
        searchPlaceholder: "Поиск мастера или дизайна...",
        buttons: [
          {
            text: "Найти мастера",
            variant: "default" as const,
            className: "gradient-bg text-white",
            icon: Users,
            action: () => navigate("/masters")
          },
          {
            text: "Посмотреть дизайны",
            variant: "outline" as const,
            className: "",
            icon: Palette,
            action: () => navigate("/designs")
          },
          {
            text: "Зарегистрироваться",
            variant: "secondary" as const,
            className: "",
            icon: User,
            action: () => navigate("/auth")
          }
        ]
      };
    }

    if (isClient()) {
      // Клиент
      const clientUser = user as any;
      const displayName = clientUser.fullName || clientUser.name || clientUser.email;
      return {
        title: `Привет, ${displayName}!`,
        subtitle: "Готовы записаться на новую процедуру? Найдите мастера или выберите дизайн",
        searchPlaceholder: "Поиск мастера или дизайна...",
        buttons: [
          {
            text: "Найти мастера",
            variant: "default" as const,
            className: "gradient-bg text-white",
            icon: Users,
            action: () => navigate("/masters")
          },
          {
            text: "Выбрать дизайн",
            variant: "outline" as const,
            className: "",
            icon: Palette,
            action: () => navigate("/designs")
          },
          {
            text: "Мои записи",
            variant: "secondary" as const,
            className: "",
            icon: Calendar,
            action: () => navigate("/client-dashboard")
          }
        ]
      };
    }

    if (isMaster()) {
      // Мастер
      const masterUser = user as any;
      const displayName = masterUser.fullName || masterUser.name || masterUser.email;
      return {
        title: `Добро пожаловать, мастер ${displayName}!`,
        subtitle: "Управляйте своими услугами, просматривайте заказы и работайте с клиентами",
        searchPlaceholder: "Поиск клиентов или заказов...",
        buttons: [
          {
            text: "Мои заказы",
            variant: "default" as const,
            className: "gradient-bg text-white",
            icon: Calendar,
            action: () => navigate("/master-dashboard")
          },
          {
            text: "Посмотреть дизайны",
            variant: "outline" as const,
            className: "",
            icon: Palette,
            action: () => navigate("/designs")
          },
          {
            text: "Мой профиль",
            variant: "secondary" as const,
            className: "",
            icon: User,
            action: () => navigate(`/master/${masterUser.id}`)
          }
        ]
      };
    }

    if (isAdmin()) {
      // Администратор
      const adminUser = user as any;
      const displayName = adminUser.fullName || adminUser.name || adminUser.email;
      return {
        title: `Панель администратора`,
        subtitle: `Добро пожаловать, ${displayName}. Управляйте платформой и пользователями`,
        searchPlaceholder: "Поиск пользователей или контента...",
        buttons: [
          {
            text: "Админ панель",
            variant: "default" as const,
            className: "gradient-bg text-white",
            icon: Crown,
            action: () => navigate("/admin-dashboard")
          },
          {
            text: "Мастера",
            variant: "outline" as const,
            className: "",
            icon: Users,
            action: () => navigate("/masters")
          },
          {
            text: "Дизайны",
            variant: "secondary" as const,
            className: "",
            icon: Palette,
            action: () => navigate("/designs")
          }
        ]
      };
    }

    // Fallback для неопределенной роли
    return {
      title: "NailMasters",
      subtitle: "Добро пожаловать на платформу поиска мастеров маникюра",
      searchPlaceholder: "Поиск...",
      buttons: [
        {
          text: "Перейти к профилю",
          variant: "default" as const,
          className: "gradient-bg text-white",
          icon: User,
          action: () => navigate("/client-dashboard")
        }
      ]
    };
  };

  const content = getPersonalizedContent();

  return (
    <div className="text-center space-y-6 py-12">
      {/* Персонализированный заголовок */}
      <h1 className="text-4xl md:text-6xl font-bold gradient-text">
        {content.title}
      </h1>
      
      {/* Персонализированное описание */}
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {content.subtitle}
      </p>
      
      {/* Поиск (только для авторизованных пользователей) */}
      {user && (
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder={content.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>
      )}

      {/* Персонализированные кнопки действий */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {content.buttons.map((button, index) => (
          <Button
            key={index}
            size="lg"
            variant={button.variant}
            className={button.className}
            onClick={button.action}
          >
            {button.icon && <button.icon className="w-4 h-4 mr-2" />}
            {button.text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
