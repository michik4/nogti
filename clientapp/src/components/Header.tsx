import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, LogOut, Home, LayoutDashboard, UserCircle, Crown, Users, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

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
          case 'nailmaster':
            items.push({
              icon: LayoutDashboard,
              label: "Дашборд",
              path: "/master-dashboard",
              active: location.pathname === "/master-dashboard",
              action: () => navigate("/master-dashboard")
            });
            break;
          
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
          path: "/client-dashboard",
          active: location.pathname === "/client-dashboard",
          action: () => {
            if (user.role === 'nailmaster') {
              navigate(`/master/${user.id}`);
            } else {
              navigate(`/client-dashboard`);
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
          label: "Войти/Регистрация",
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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between p-4">
        <h1 
          className="text-xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          NailMasters
        </h1>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Десктопная навигация */}
              <nav className="hidden md:flex items-center gap-2">
                {navigationItems.map((item, index) => (
                  <Button
                    key={`${item.path}-${index}`}
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    onClick={item.action}
                    className="flex items-center gap-2"
                    title={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>

              {/* Мобильная навигация */}
              <nav className="md:hidden flex items-center gap-1">
                {navigationItems.map((item, index) => (
                  <Button
                    key={`mobile-${item.path}-${index}`}
                    variant={item.active ? "default" : "ghost"}
                    size="icon"
                    onClick={item.action}
                    title={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                  </Button>
                ))}
              </nav>
            </>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Войти
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header; 