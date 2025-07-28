import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { Master } from "@/types/user.types";
import { Skeleton } from "@/components/ui/skeleton";

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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
          Популярные мастера
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Скелетон для загрузки
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-1/4 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            masters.map((master) => (
              <Card 
                key={master.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleMasterClick(master.id)}
              >
                <CardHeader>
                  <SmartAvatar 
                    src={master.avatar} 
                    alt={master.fullName}
                    fallback={master.fullName[0]}
                    className="w-24 h-24 mx-auto"
                  />
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-lg font-semibold">{master.fullName}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {Array.isArray(master.specialties) && master.specialties.length > 0 
                      ? master.specialties.join(", ") 
                      : "Мастер маникюра"}
                  </CardDescription>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{master.rating || "Нет оценок"}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" onClick={() => navigate("/masters")}>
            Посмотреть всех мастеров
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularMasters;
