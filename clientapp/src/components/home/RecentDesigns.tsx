import { Clock, Heart, Star, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/image.util";
import { formatCustomDate } from "@/utils/time.util";

// Моковые данные для новых дизайнов
const recentDesigns = [
  {
    id: "1",
    title: "Весенняя свежесть",
    description: "Легкий дизайн с нежными цветочными мотивами",
    image: "/placeholder.svg",
    author: "Анна Петрова",
    rating: 4.8,
    likes: 45,
    views: 320,
    price: 2800,
    category: "Романтичные",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
    isNew: true
  },
  {
    id: "2",
    title: "Металлический блеск",
    description: "Современный дизайн с металлическими элементами",
    image: "/placeholder.svg",
    author: "Мария Иванова",
    rating: 4.9,
    likes: 67,
    views: 450,
    price: 3500,
    category: "Дизайнерские",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
    isNew: true
  },
  {
    id: "3",
    title: "Пастельная мечта",
    description: "Мягкие пастельные тона для повседневного образа",
    image: "/placeholder.svg",
    author: "Елена Сидорова",
    rating: 4.7,
    likes: 34,
    views: 280,
    price: 2200,
    category: "Базовые",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
    isNew: true
  },
  {
    id: "4",
    title: "Геометрический шик",
    description: "Стильный дизайн с геометрическими элементами",
    image: "/placeholder.svg",
    author: "Ольга Козлова",
    rating: 4.6,
    likes: 28,
    views: 210,
    price: 3000,
    category: "Трендовые",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 часов назад
    isNew: true
  },
  {
    id: "5",
    title: "Элегантная классика",
    description: "Вневременной дизайн для любого случая",
    image: "/placeholder.svg",
    author: "Наталья Волкова",
    rating: 4.8,
    likes: 52,
    views: 380,
    price: 2500,
    category: "Базовые",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 часов назад
    isNew: true
  },
  {
    id: "6",
    title: "Абстрактная фантазия",
    description: "Уникальный дизайн с абстрактными элементами",
    image: "/placeholder.svg",
    author: "Ирина Морозова",
    rating: 4.9,
    likes: 73,
    views: 520,
    price: 4000,
    category: "Премиум",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 часа назад
    isNew: true
  }
];

const RecentDesigns = () => {
  const navigate = useNavigate();

  const handleDesignClick = (designId: string) => {
    navigate(`/design/${designId}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Новые дизайны
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Свежие работы наших мастеров, которые только что появились на платформе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDesigns.map((design) => (
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
                  <Badge variant="secondary" className="bg-blue-500 text-white">
                    Новый
                  </Badge>
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    {design.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    <Clock className="w-3 h-3" />
                    {formatCustomDate(design.createdAt)}
                  </div>
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
            Смотреть все новые дизайны
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentDesigns; 