import { Upload, Play, Heart, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Заглушка: данные загрузок пока не реализованы
// import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Компонент вкладки с загрузками пользователя
 * Отображает фото и видео, загруженные пользователем
 */
const UploadsTab = () => {
  // Заглушка: пока нет данных о загрузках
  const uploads: any[] = [];
  const removeUpload = (uploadId: string) => {
    console.log('Удаление загрузки (заглушка):', uploadId);
  };
  const { toast } = useToast();

  // Обработчик просмотра всех загрузок
  const handleViewUploads = () => {
    toast({
      title: "Мои загрузки",
      description: "Показаны все ваши загрузки.",
    });
  };

  // Обработчик удаления загрузки
  const handleDeleteUpload = (uploadId: string) => {
    removeUpload(uploadId);
    toast({
      title: "Загрузка удалена",
      description: "Контент удален из ваших загрузок.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Мои загрузки ({uploads.length})
          </div>
          <Button size="sm" variant="outline" onClick={handleViewUploads}>
            Все загрузки
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uploads.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {uploads.slice(0, 4).map((upload) => (
              <div key={upload.id} className="relative group">
                <div className="relative">
                  {/* Превью загрузки */}
                  {upload.type === "video" ? (
                    <div className="relative">
                      <video 
                        src={upload.image} 
                        className="w-full h-32 rounded-lg object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <div className="bg-black/70 rounded-full p-1">
                          <Video className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={upload.image} 
                      alt={upload.title}
                      className="w-full h-32 rounded-lg object-cover"
                    />
                  )}
                  
                  {/* Оверлей с кнопкой удаления */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteUpload(upload.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
                
                {/* Информация о загрузке */}
                <div className="mt-2">
                  <h4 className="font-medium text-sm">{upload.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{upload.date}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{upload.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">У вас пока нет загрузок</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadsTab;
