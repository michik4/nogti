
import HeroSection from "@/components/home/HeroSection";
import PopularMasters from "@/components/home/PopularMasters";
import PopularDesigns from "@/components/home/PopularDesigns";
import CallToAction from "@/components/home/CallToAction";

/**
 * Главная страница для неавторизованных пользователей
 * Показывает основную информацию о платформе и популярный контент
 */
const GuestHomePage = () => {
  return (
    <div className="space-y-8">
      {/* Главная секция с заголовком и поиском */}
      <HeroSection />

      {/* Популярные мастера */}
      <PopularMasters />

      {/* Популярные дизайны */}
      <PopularDesigns />

      {/* Призыв к действию */}
      <CallToAction />
    </div>
  );
};

export default GuestHomePage;
