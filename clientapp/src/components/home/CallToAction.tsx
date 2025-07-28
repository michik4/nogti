
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Секция призыва к действию
 * Финальная секция для привлечения пользователей к регистрации
 */
const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-pink-50 to-violet-50 dark:from-pink-950/20 dark:to-violet-950/20 rounded-2xl p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">Присоединяйтесь к NailMasters</h2>
      <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
        Более 1000 мастеров уже работают на нашей платформе. 
        Начните зарабатывать больше уже сегодня!
      </p>
      
      {/* Кнопки регистрации */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="gradient-bg text-white" onClick={() => navigate("/auth")}>
          Стать мастером
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
          Найти мастера
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
