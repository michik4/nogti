import { ReactNode } from "react";
import Header from "@/components/Header";
import { GuestSessionManager } from "@/components/GuestSessionManager";
import GuestModeNotification from "@/components/GuestModeNotification";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

/**
 * Общий компонент Layout для всех страниц
 * Включает хедер, управление гостевой сессией и уведомления
 */
const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GuestSessionManager />
      
      {showHeader && <Header />}
      
      <main className={showHeader ? "md:ml-40 ml-0 md:pb-0 pb-20" : ""}>
        {children}
      </main>
      
      
    </div>
  );
};

export default Layout; 