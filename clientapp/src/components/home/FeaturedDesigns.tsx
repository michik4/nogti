import { Heart, Star, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/image.util";

// Моковые данные для избранных дизайнов
const featuredDesigns = [
  {
    id: "1",
    title: "Нежный градиент",
    description: "Романтичный дизайн с переходом от розового к персиковому",
    image: "/placeholder.svg",
    author: "Анна Петрова",
    rating: 4.9,
    likes: 156,
    views: 1200,
    price: 2500,
    category: "Романтичные",
    isNew: true
  },
  {
    id: "2",
    title: "Геометрический минимализм",
    description: "Современный дизайн с четкими линиями и формами",
    image: "/placeholder.svg",
    author: "Мария Иванова",
    rating: 4.8,
    likes: 203,
    views: 1800,
    price: 3000,
    category: "Дизайнерские",
    isNew: false
  },
  {
    id: "3",
    title: "Цветочная фантазия",
    description: "Изысканный дизайн с ручной росписью цветов",
    image: "/placeholder.svg",
    author: "Елена Сидорова",
    rating: 5.0,
    likes: 89,
    views: 950,
    price: 4000,
    category: "Премиум",
    isNew: true
  },
  {
    id: "4",
    title: "Металлический шик",
    description: "Элегантный дизайн с металлическими акцентами",
    image: "/placeholder.svg",
    author: "Ольга Козлова",
    rating: 4.7,
    likes: 134,
    views: 1100,
    price: 2800,
    category: "Трендовые",
    isNew: false
  },
  {
    id: "5",
    title: "Пастельная нежность",
    description: "Мягкие пастельные тона для повседневного образа",
    image: "/placeholder.svg",
    author: "Наталья Волкова",
    rating: 4.6,
    likes: 98,
    views: 850,
    price: 2200,
    category: "Базовые",
    isNew: false
  },
  {
    id: "6",
    title: "Абстрактное искусство",
    description: "Уникальный дизайн с абстрактными элементами",
    image: "/placeholder.svg",
    author: "Ирина Морозова",
    rating: 4.9,
    likes: 167,
    views: 1400,
    price: 3500,
    category: "Дизайнерские",
    isNew: true
  }
];

const FeaturedDesigns = () => {
  const navigate = useNavigate();

  const handleDesignClick = (designId: string) => {
    navigate(`/design/${designId}`);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Избранные дизайны
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Лучшие работы наших мастеров, которые вдохновят вас на создание уникального образа
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDesigns.map((design) => (
            <Card 
              key={design.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onClick={() => handleDesignClick(design.id)}
            >
              <div className="relative">
                <img 
                  src={getImageUrl(design.image)} 
                  alt={design.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {design.isNew && (
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      Новинка
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    {design.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{design.title}</h3>
                  <span className="font-bold text-primary">{design.price}₽</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {design.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{design.rating}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {design.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {design.views}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Автор: {design.author}
                  </span>
                  <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    Записаться
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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

export default FeaturedDesigns; 