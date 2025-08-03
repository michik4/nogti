import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, LogOut, Home, LayoutDashboard, UserCircle, Crown, Users, Palette, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы.",
    });
    
    // Перезагружаем страницу для полной очистки состояния
    setTimeout(() => {
      window.location.href = "/";
    }, 500); // Небольшая задержка для показа уведомления
  };

  // Получаем все навигационные элементы включая профиль и настройки
  const getNavigationItems = () => {
    const items = [];

    if (user) {
      // Главная страница (доступна всем авторизованным)
      items.push({
        icon: Home,
        label: "Главная",
        path: "/",
        active: location.pathname === "/",
        action: () => navigate("/")
      });

      // Страница мастеров (доступна всем авторизованным)
      items.push({
        icon: Users,
        label: "Мастера",
        path: "/masters",
        active: location.pathname === "/masters",
        action: () => navigate("/masters")
      });

      // Страница дизайнов (доступна всем авторизованным)
      items.push({
        icon: Palette,
        label: "Дизайны",
        path: "/designs",
        active: location.pathname === "/designs",
        action: () => navigate("/designs")
      });

      // Роль-специфичные элементы
      if ('role' in user) {
        switch (user.role) {
          
          
          case 'admin':
            items.push({
              icon: Crown,
              label: "Админ панель",
              path: "/admin-dashboard",
              active: location.pathname === "/admin-dashboard",
              action: () => navigate("/admin-dashboard")
            });
            items.push({
              icon: Settings,
              label: "Настройки",
              path: "/admin-dashboard",
              active: false,
              action: () => navigate("/admin-dashboard")
            });
            break;
          
          case 'client':
            items.push({
              icon: UserCircle,
              label: "Профиль",
              path: "/client-dashboard",
              active: location.pathname === "/client-dashboard",
              action: () => navigate("/client-dashboard")
            });
            break;
        }
      } else if ('type' in user && user.type === 'guest') {
        items.push({
          icon: UserCircle,
          label: "Профиль",
          path: "/client-dashboard",
          active: location.pathname === "/client-dashboard",
          action: () => navigate("/client-dashboard")
        });
      }

      // Кнопка профиля (если это не админ и не совпадает с уже добавленным профилем)
      const hasProfileButton = items.some(item => item.icon === UserCircle);
      if (!hasProfileButton && 'role' in user && user.role !== 'client') {
        items.push({
          icon: User,
          label: "Профиль",
          path: user.role === 'nailmaster' ? "/master-dashboard" : "/client-dashboard",
          active: location.pathname === (user.role === 'nailmaster' ? "/master-dashboard" : "/client-dashboard"),
          action: () => {
            if (user.role === 'nailmaster') {
              navigate("/master-dashboard");
            } else {
              navigate("/client-dashboard");
            }
          }
        });
      }

      // Проверяем, является ли пользователь гостем
      const isGuestUser = ('type' in user && user.type === 'guest') || ('isGuest' in user && user.isGuest === true);
      
      if (isGuestUser) {
        // Для гостевых пользователей показываем кнопку входа/регистрации
        items.push({
          icon: User,
          label: "Войти",
          path: "/auth",
          active: location.pathname === "/auth",
          action: () => navigate("/auth")
        });
      } else {
        // Для авторизованных пользователей показываем кнопку выхода
        items.push({
          icon: LogOut,
          label: "Выйти",
          path: "",
          active: false,
          action: handleLogout
        });
      }
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Десктопный хедер */}
      <header className="fixed top-0 left-0 z-50 w-40 h-screen bg-background/80 backdrop-blur-md border-r border-border hidden md:block">
        <div className="flex flex-col items-center h-full py-4">
          {/* Логотип */}
          <div className="mb-8">
            <h1 
              className="text-lg font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
              onClick={() => navigate("/")}
            >
              NM
            </h1>
          </div>
        
        {/* Навигация */}
        <nav className="flex flex-col items-start gap-3 flex-1 w-full px-2">
          {user ? (
            <>
              {navigationItems.map((item, index) => (
                <div 
                  key={`${item.path}-${index}`} 
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={item.action}
                >
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.action();
                    }}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                  </Button>
                  <span 
                    className={`text-base leading-tight transition-colors ${
                      item.active 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div 
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => navigate("/auth")}
            >
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/auth");
                }}
                className="w-10 h-10 rounded-full flex-shrink-0"
                title="Войти"
              >
                <User className="w-5 h-5" />
              </Button>
              <span 
                className="text-base text-muted-foreground leading-tight transition-colors group-hover:text-foreground"
              >
                Войти
              </span>
            </div>
          )}
        </nav>

        {/* Нижние элементы */}
        <div className="flex flex-col items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>

      {/* Мобильный хедер снизу */}
      <header className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border md:hidden">
        <nav className="flex items-center justify-around px-4 py-3">
          {navigationItems.slice(0, 4).map((item, index) => (
            <Button
              key={`mobile-nav-${item.path}-${index}`}
              variant={item.active ? "default" : "ghost"}
              size="icon"
              onClick={() => item.action()}
              className="w-12 h-12 rounded-full"
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </Button>
          ))}
        </nav>
      </header>
    </>
  );
};

export default Header; 