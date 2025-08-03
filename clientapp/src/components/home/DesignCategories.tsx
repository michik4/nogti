import { Sparkles, Palette, Heart, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: "featured",
    name: "Избранные",
    description: "Лучшие дизайны от топ-мастеров",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    count: "500+"
  },
  {
    id: "basic",
    name: "Базовые",
    description: "Классические и простые дизайны",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    count: "1200+"
  },
  {
    id: "designer",
    name: "Дизайнерские",
    description: "Уникальные и сложные работы",
    icon: Palette,
    color: "from-orange-500 to-red-500",
    count: "800+"
  },
  {
    id: "trending",
    name: "Трендовые",
    description: "Самые популярные сейчас",
    icon: Zap,
    color: "from-green-500 to-emerald-500",
    count: "300+"
  },
  {
    id: "romantic",
    name: "Романтичные",
    description: "Нежные и милые дизайны",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    count: "600+"
  },
  {
    id: "premium",
    name: "Премиум",
    description: "Эксклюзивные работы мастеров",
    icon: Star,
    color: "from-yellow-500 to-orange-500",
    count: "200+"
  }
];

const DesignCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/designs?category=${categoryId}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Категории дизайнов
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите категорию, которая подходит вашему стилю и настроению
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Смотреть дизайны
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/designs')}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            Смотреть все дизайны
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DesignCategories; 