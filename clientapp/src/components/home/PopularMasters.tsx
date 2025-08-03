import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { Master } from "@/types/user.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const PopularMasters = () => {
  const navigate = useNavigate();
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await userService.getPopularMasters();
        if (response.success && response.data) {
          setMasters(response.data);
        } else {
          setError(response.error || "Не удалось загрузить мастеров");
        }
      } catch (err) {
        setError("Произошла ошибка при загрузке мастеров");
      } finally {
        setLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const handleMasterClick = (masterId: string) => {
    navigate(`/master/${masterId}`);
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        {error}
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
            Топ мастеров
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выбирайте из проверенных мастеров с высокими рейтингами и отзывами
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Скелетон для загрузки
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-1/4 mx-auto" />
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            masters.map((master) => (
              <Card 
                key={master.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md hover:scale-105"
                onClick={() => handleMasterClick(master.id)}
              >
                <CardHeader className="text-center pb-4 pt-6">
                  <div className="relative">
                    <SmartAvatar 
                      src={master.avatar} 
                      alt={master.fullName}
                      fallback={master.fullName[0]}
                      className="w-20 h-20 mx-auto ring-4 ring-pink-100 dark:ring-pink-900/20 group-hover:ring-pink-200 dark:group-hover:ring-pink-800/30 transition-all"
                    />
                    {master.rating && master.rating >= 4.5 && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs">
                        Топ
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-1">{master.fullName}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {Array.isArray(master.specialties) && master.specialties.length > 0 
                        ? master.specialties.join(", ") 
                        : "Мастер маникюра"}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{master.rating || "Нет оценок"}</span>
                    {master.reviewsCount && (
                      <span className="text-muted-foreground">({master.reviewsCount})</span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    {master.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{master.location}</span>
                      </div>
                    )}
                    {master.experience && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{master.experience} лет</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-pink-50 dark:group-hover:bg-pink-950/20 transition-colors"
                    >
                      Посмотреть профиль
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate("/masters")}
            className="px-8 py-3 text-base font-medium hover:bg-pink-50 dark:hover:bg-pink-950/20"
          >
            Посмотреть всех мастеров
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularMasters;
