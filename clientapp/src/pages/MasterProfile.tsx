import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileProfileView from "@/components/master-profile/MobileProfileView";
import DesktopProfileView from "@/components/master-profile/DesktopProfileView";
import { userService } from "@/services/userService";
import { Master } from "@/types/user.types";
import { Skeleton } from "@/components/ui/skeleton";

const MasterProfile = () => {
  const { masterId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterProfile = async () => {
      if (!masterId) {
        setError("ID мастера не указан");
        setLoading(false);
        return;
      }

      try {
        const response = await userService.getMasterProfile(masterId);
        if (response.success && response.data) {
          setMaster(response.data);
        } else {
          setError(response.error || "Не удалось загрузить данные мастера");
        }
      } catch (err) {
        setError("Произошла ошибка при загрузке данных мастера");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterProfile();
  }, [masterId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !master) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Мастер не найден"}
          </h1>
          <button 
            onClick={() => navigate("/")}
            className="text-primary hover:underline"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return isMobile ? (
    <MobileProfileView master={master} onBack={handleBack} />
  ) : (
    <DesktopProfileView master={master} onBack={handleBack} />
  );
};

export default MasterProfile;
