import { useAuth } from "@/contexts/AuthContext";
import GuestHomePage from "@/components/GuestHomePage";
import { GuestSessionManager } from "@/components/GuestSessionManager";
import GuestModeNotification from "@/components/GuestModeNotification";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTikTokView from "@/components/mobile/MobileTikTokView";
import Header from "@/components/Header";

const Index = () => {
  console.log('Index component rendering...');
  
  const { user } = useAuth();
  const isMobile = useIsMobile();

  console.log('Index render state:', { 
    isMobile, 
    user: user ? ('type' in user ? user.type : ('role' in user ? user.role : null)) : null,
    userContext: !!useAuth,
    windowWidth: window.innerWidth
  });

  // Мобильная TikTok-версия
  if (isMobile) {
    console.log('Rendering mobile version...');
    return (
      <div className="min-h-screen bg-background text-foreground">
        <GuestSessionManager />
        <MobileTikTokView />
        <GuestModeNotification />
      </div>
    );
  }

  console.log('Rendering desktop version...');
  // Десктопная версия - всегда показываем GuestHomePage
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GuestSessionManager />
      
      <Header />

      <main className="container mx-auto p-6">
        <GuestHomePage />
      </main>

      <GuestModeNotification />
    </div>
  );
};

export default Index;
