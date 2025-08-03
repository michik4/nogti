import { Palette, Users, Star, Heart, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    id: "designs",
    title: "Дизайнов",
    value: "5000+",
    description: "Уникальных работ",
    icon: Palette,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "masters",
    title: "Мастеров",
    value: "150+",
    description: "Профессионалов",
    icon: Users,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "rating",
    title: "Средний рейтинг",
    value: "4.8",
    description: "По отзывам клиентов",
    icon: Star,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "favorites",
    title: "В избранном",
    value: "25000+",
    description: "Сохранено дизайнов",
    icon: Heart,
    color: "from-red-500 to-pink-500"
  },
  {
    id: "bookings",
    title: "Записей",
    value: "12000+",
    description: "Успешно выполнено",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "awards",
    title: "Наград",
    value: "50+",
    description: "Мастерам за качество",
    icon: Award,
    color: "from-indigo-500 to-purple-500"
  }
];

const DesignStats = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Платформа в цифрах
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Мы гордимся тем, что помогаем мастерам и клиентам находить друг друга
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-1">
                      {stat.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">
              Присоединяйтесь к нам!
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Станьте частью сообщества профессионалов и найдите идеальный дизайн для себя
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Найти мастера
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Стать мастером
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignStats; 