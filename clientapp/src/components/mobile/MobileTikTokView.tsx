import { useState } from "react";
import { Search, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MasterCard } from "@/components/MasterCard";
import { SearchSheet } from "./SearchSheet";
import { MastersCatalog } from "./MastersCatalog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { mockMasters } from "@/data/mockMasters";

const MobileTikTokView = () => {
  const [currentMasterIndex, setCurrentMasterIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { user: currentUser, logout, isMaster } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('MobileTikTokView render, currentMasterIndex:', currentMasterIndex);

  const handleSwipe = (direction: 'up' | 'down') => {
    console.log('Swipe detected:', direction);
    if (direction === 'up' && currentMasterIndex < mockMasters.length - 1) {
      setCurrentMasterIndex(prev => prev + 1);
    } else if (direction === 'down' && currentMasterIndex > 0) {
      setCurrentMasterIndex(prev => prev - 1);
    }
  };

  const handleMasterSelect = () => {
    if (!currentUser) {
      navigate("/auth");
    } else {
      console.log('Master selected');
    }
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    if (isMaster()) {
      navigate("/master-dashboard");
    } else {
      navigate("/profile");
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы.",
    });
    navigate("/");
  };

  const currentMaster = mockMasters[currentMasterIndex];

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Заголовок */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between p-4 pt-12">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsCatalogOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <h1 className="text-xl font-bold text-white">NailMasters</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleProfileClick}
            >
              <User className="w-5 h-5" />
            </Button>

            {currentUser && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleLogout}
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент - карточка мастера */}
      <div className="absolute inset-0">
        <MasterCard
          master={currentMaster}
          onSelect={handleMasterSelect}
          onSwipe={handleSwipe}
          isMobile={true}
        />
      </div>

      {/* Индикатор прогресса */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {mockMasters.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-6 rounded-full transition-colors ${
              index === currentMasterIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Модальные окна */}
      <SearchSheet 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      
      <MastersCatalog 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
      />
    </div>
  );
};

export default MobileTikTokView;
