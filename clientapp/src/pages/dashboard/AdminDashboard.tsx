import { useState, useEffect } from "react";
import { ArrowLeft, Users, Calendar, Palette, Upload, BarChart3, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/utils/image.util";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [designsTab, setDesignsTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMasters: 0,
    totalClients: 0,
    totalBookings: 0,
    totalDesigns: 0,
    totalUploads: 0,
    revenue: 0,
    activeBookings: 0
  });

  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [designSearchTerm, setDesignSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Загрузка статистики
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить статистику",
          variant: "destructive"
        });
      }
    };
    loadStats();
  }, []);

  // Загрузка пользователей
  useEffect(() => {
    const loadUsers = async () => {
      if (activeTab === "users") {
        try {
          const response = await adminService.getUsers({
            page: currentPage,
            limit: 10,
            search: searchTerm
          });
          if (response.success && response.data) {
            setUsers(response.data.users);
          }
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список пользователей",
            variant: "destructive"
          });
        }
      }
    };
    loadUsers();
  }, [activeTab, currentPage, searchTerm]);

  // Загрузка заказов
  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab === "bookings") {
        try {
          const response = await adminService.getOrders({
            page: currentPage,
            limit: 10
          });
          if (response.success && response.data) {
            setOrders(response.data.orders);
          }
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список заказов",
            variant: "destructive"
          });
        }
      }
    };
    loadOrders();
  }, [activeTab, currentPage]);

  // Загрузка дизайнов
  useEffect(() => {
    const loadDesigns = async () => {
      if (activeTab === "designs") {
        setDesignsLoading(true);
        try {
          const response = await adminService.getDesigns({
            page: currentPage,
            limit: 10,
            isModerated: designsTab === "moderation" ? false : undefined,
            search: designSearchTerm || undefined
          });
          if (response.success && response.data) {
            setDesigns(response.data.designs);
          }
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список дизайнов",
            variant: "destructive"
          });
        } finally {
          setDesignsLoading(false);
        }
      }
    };
    
    // Добавляем небольшую задержку для поиска
    const timeoutId = setTimeout(loadDesigns, 300);
    return () => clearTimeout(timeoutId);
  }, [activeTab, currentPage, designsTab, designSearchTerm]);

  // Блокировка пользователя
  const handleToggleBlock = async (userId: string, blocked: boolean) => {
    try {
      const response = await adminService.toggleUserBlock(userId, blocked);
      if (response.success) {
        toast({
          title: "Успешно",
          description: `Пользователь ${blocked ? 'заблокирован' : 'разблокирован'}`,
        });
        // Обновляем список пользователей
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, blocked } : user
        );
        setUsers(updatedUsers);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус пользователя",
        variant: "destructive"
      });
    }
  };

  // Модерация дизайна
  const handleModerateContent = async (designId: string, approved: boolean) => {
    try {
      const response = await adminService.moderateDesign(designId, approved);
      if (response.success) {
        toast({
          title: "Успешно",
          description: `Дизайн ${approved ? 'одобрен' : 'отклонен'}`,
        });
        // Обновляем список дизайнов
        const updatedDesigns = designs.filter(design => design.id !== designId);
        setDesigns(updatedDesigns);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус дизайна",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Панель администратора</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Админ панель</h1>
          <p className="text-muted-foreground">Управление платформой NailMasters</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="bookings">Записи</TabsTrigger>
            <TabsTrigger value="designs">Дизайны</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Мастера: {stats.totalMasters}</span>
                    <span className="text-xs text-muted-foreground">Клиенты: {stats.totalClients}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные записи</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Всего записей: {stats.totalBookings}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доходы</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₽{stats.revenue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Дизайны</CardTitle>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDesigns}</div>
                  <p className="text-xs text-muted-foreground">
                    Загрузок: {stats.totalUploads}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Список всех пользователей платформы</CardDescription>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск пользователей..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Администратор' : user.role === 'nailmaster' ? 'Мастер' : 'Клиент'}
                          </Badge>
                          <Button
                            variant={user.blocked ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleToggleBlock(user.id, !user.blocked)}
                          >
                            {user.blocked ? 'Разблокировать' : 'Заблокировать'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      {searchTerm 
                        ? 'По вашему запросу пользователи не найдены' 
                        : 'Список пользователей пуст'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление записями</CardTitle>
                <CardDescription>Все записи на платформе</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Клиент: {order.clientName}</p>
                          <p className="text-sm">Мастер: {order.masterName}</p>
                          <p className="text-sm text-muted-foreground">
                            Дата: {new Date(order.requestedDateTime).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            order.status === 'confirmed' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'completed' ? 'outline' : 'destructive'
                          }
                        >
                          {order.status === 'confirmed' ? 'Подтверждена' :
                           order.status === 'pending' ? 'Ожидание' :
                           order.status === 'completed' ? 'Завершена' : 'Отменена'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Список заказов пуст
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление дизайнами</CardTitle>
                <CardDescription>Просмотр и модерация дизайнов</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4" onValueChange={(value) => {
                  setDesignsTab(value);
                  setDesignSearchTerm(""); // Сбрасываем поиск при смене вкладки
                }}>
                  <TabsList>
                    <TabsTrigger value="all">Все дизайны</TabsTrigger>
                    <TabsTrigger value="moderation">На модерации</TabsTrigger>
                  </TabsList>

                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск дизайнов..."
                      className="pl-8"
                      value={designSearchTerm}
                      onChange={(e) => setDesignSearchTerm(e.target.value)}
                    />
                  </div>

                  <TabsContent value="all" className="space-y-4">
                    {designsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((index) => (
                          <Card key={index}>
                            <CardHeader>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <Skeleton className="h-[300px] w-full rounded-lg" />
                                <div className="flex items-center justify-between">
                                  <Skeleton className="h-5 w-20" />
                                  <Skeleton className="h-5 w-20" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : designs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {designs.map((design) => (
                          <Card key={design.id}>
                            <CardHeader>
                              <CardTitle>{design.title}</CardTitle>
                              <CardDescription>
                                Автор: {design.authorName} • Тип: {design.type}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                                <img 
                                  src={getImageUrl(design.imageUrl) || '/placeholder.svg'} 
                                  alt={design.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant={design.isActive ? "default" : "secondary"}>
                                  {design.isActive ? 'Активный' : 'Неактивный'}
                                </Badge>
                                <Badge variant={design.isModerated ? "outline" : "secondary"}>
                                  {design.isModerated ? 'Проверен' : 'Не проверен'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          {designSearchTerm ? 'По вашему запросу дизайны не найдены' : 'Список дизайнов пуст'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="moderation" className="space-y-4">
                    {designsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((index) => (
                          <Card key={index}>
                            <CardHeader>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <Skeleton className="h-[300px] w-full rounded-lg" />
                                <div className="flex justify-end gap-2">
                                  <Skeleton className="h-9 w-24" />
                                  <Skeleton className="h-9 w-24" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : designs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {designs.map((design) => (
                          <Card key={design.id}>
                            <CardHeader>
                              <CardTitle>{design.title}</CardTitle>
                              <CardDescription>
                                Автор: {design.authorName} • Тип: {design.type}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                                <img 
                                  src={getImageUrl(design.imageUrl) || '/placeholder.svg'} 
                                  alt={design.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModerateContent(design.id, false)}
                                >
                                  Отклонить
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleModerateContent(design.id, true)}
                                >
                                  Одобрить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          {designSearchTerm ? 'По вашему запросу дизайны не найдены' : 'Нет дизайнов для модерации'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
