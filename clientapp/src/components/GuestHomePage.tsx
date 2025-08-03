
import HeroSection from "@/components/home/HeroSection";
import DesignCategories from "@/components/home/DesignCategories";
import FeaturedDesigns from "@/components/home/FeaturedDesigns";
import RecentDesigns from "@/components/home/RecentDesigns";
import DesignStats from "@/components/home/DesignStats";
import CallToAction from "@/components/home/CallToAction";

/**
 * Главная страница для неавторизованных пользователей
 * Современный дизайн с акцентом на каталог дизайнов маникюра
 */
const GuestHomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Главная секция с заголовком и поиском дизайнов */}
      <HeroSection />

      {/* Категории дизайнов */}
      <DesignCategories />

      {/* Избранные дизайны */}
      <FeaturedDesigns />

      {/* Новые дизайны */}
      <RecentDesigns />

      {/* Статистика платформы */}
      <DesignStats />

      {/* Призыв к действию */}
      <CallToAction />
    </div>
  );
};

export default GuestHomePage;
