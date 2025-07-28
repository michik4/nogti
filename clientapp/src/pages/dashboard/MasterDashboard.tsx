import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Settings, Calendar, Star, Plus, Users, TrendingUp, Clock, DollarSign, Upload, Heart, Play, CheckCircle, XCircle, Eye, Palette, Search, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Master } from "@/types/user.types";
import { MasterService, MasterStats, MasterDesign, MasterServiceDesign } from "@/types/master.types";
import EditProfileModal from "@/components/EditProfileModal";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { masterService } from "@/services/masterService";
import { AddServiceModal } from "@/components/AddServiceModal";
import BrowseDesignsModal from "@/components/BrowseDesignsModal";
import AddDesignModal from "@/components/AddDesignModal";
import EditServiceDesignModal from "@/components/EditServiceDesignModal";
import { designService, NailDesign } from "@/services/designService";
import MasterOrdersTab from "./components/MasterOrdersTab";
import AvatarUpload from "@/components/ui/avatar-upload";
import { getImageUrl } from "@/utils/image.util";

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, isLoading: isAuthLoading, isMaster } = useAuth();
  const [activeTab, setActiveTab] = useState<"services" | "designs" | "orders">("services");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [services, setServices] = useState<MasterService[]>([]);
  const [designs, setDesigns] = useState<MasterDesign[]>([]);
  const [stats, setStats] = useState<MasterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  
  // Состояния для модалок дизайнов
  const [isBrowseDesignsOpen, setIsBrowseDesignsOpen] = useState(false);
  const [isAddDesignOpen, setIsAddDesignOpen] = useState(false);
  const [isEditServiceDesignOpen, setIsEditServiceDesignOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MasterService | null>(null);
  const [selectedServiceDesign, setSelectedServiceDesign] = useState<MasterServiceDesign | null>(null);
  const [serviceDesigns, setServiceDesigns] = useState<{ [serviceId: string]: MasterServiceDesign[] }>({});
  
  useEffect(() => {
    if (isAuthLoading) return;

    if (!currentUser || !isMaster()) {
      navigate('/auth');
      return;
    }

    const fetchMasterData = async () => {
      try {
        setIsLoading(true);
        if (!currentUser?.id) {
          console.error('ID мастера не найден');
          toast.error('Ошибка загрузки данных: ID мастера не найден');
          return;
        }

        console.log('Начало загрузки данных для мастера:', currentUser.id);
        
        const [servicesData, designsResponse, statsData] = await Promise.all([
          masterService.getMasterServices(currentUser.id).catch(error => {
            console.error('Ошибка загрузки услуг:', error);
            return [];
          }),
          designService.getMasterDesigns(currentUser.id).catch(error => {
            console.error('Ошибка загрузки дизайнов:', error);
            return { success: false, data: [], error: 'Ошибка загрузки дизайнов' };
          }),
          masterService.getMasterStats().catch(error => {
            console.error('Ошибка загрузки статистики:', error);
            return null;
          })
        ]);

        console.log('Полученные данные:', {
          services: servicesData,
          designs: designsResponse,
          stats: statsData
        });

        // Устанавливаем услуги
        setServices(servicesData);

        // Загружаем дизайны для каждой услуги
        const serviceDesignsData: { [serviceId: string]: MasterServiceDesign[] } = {};
        
        console.log('Начинаем загрузку дизайнов для каждой услуги...');
        for (const service of servicesData) {
          try {
            console.log(`Загружаем дизайны для услуги ${service.id} (${service.name})`);
            const designs = await masterService.getServiceDesigns(service.id);
            console.log(`Получены дизайны для услуги ${service.id}:`, designs);
            serviceDesignsData[service.id] = designs;
          } catch (error) {
            console.error(`Ошибка загрузки дизайнов для услуги ${service.id}:`, error);
            serviceDesignsData[service.id] = [];
          }
        }
        
        console.log('Все загруженные дизайны услуг:', serviceDesignsData);
        setServiceDesigns(serviceDesignsData);

        // Устанавливаем дизайны
        if (designsResponse.success && designsResponse.data) {
          const masterDesigns: MasterDesign[] = designsResponse.data.map(design => ({
            id: design.id,
            nailDesign: design,
            isActive: design.isActive,
            customPrice: design.estimatedPrice || 0,
            estimatedDuration: 60, // значение по умолчанию
            addedAt: design.createdAt
          }));
          setDesigns(masterDesigns);
        }
        
        // Устанавливаем статистику
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error('Общая ошибка загрузки данных:', error);
        toast.error('Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, [currentUser, navigate, isAuthLoading]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser || !isMaster()) {
    return null;
  }

  const masterData = currentUser as Master;

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleAddService = async (serviceData: Partial<MasterService>) => {
    try {
      if (!currentUser?.id) {
        toast.error('Ошибка: ID мастера не найден');
        return;
      }
      
      const newService = await masterService.addMasterService(currentUser.id, serviceData);
      
      if (!newService || !newService.id) {
        toast.error('Ошибка: Не удалось создать услугу');
        return;
      }
      
      setServices(prev => [...prev, newService]);
      setServiceDesigns(prev => ({ ...prev, [newService.id]: [] }));
      toast.success('Услуга добавлена');
      setIsAddServiceModalOpen(false);
    } catch (error) {
      console.error('Ошибка добавления услуги:', error);
      toast.error('Не удалось добавить услугу');
    }
  };

  const handleUpdateService = async (serviceId: string, updates: Partial<MasterService>) => {
    try {
      const updatedService = await masterService.updateMasterService(serviceId, updates);
      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ));
      toast.success('Услуга обновлена');
    } catch (error) {
      console.error('Ошибка обновления услуги:', error);
      toast.error('Не удалось обновить услугу');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await masterService.deleteMasterService(serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
      setServiceDesigns(prev => {
        const newDesigns = { ...prev };
        delete newDesigns[serviceId];
        return newDesigns;
      });
      toast.success('Услуга удалена');
    } catch (error) {
      console.error('Ошибка удаления услуги:', error);
      toast.error('Не удалось удалить услугу');
    }
  };

  // Обработчики для дизайнов услуг
  const handleOpenBrowseDesigns = (service: MasterService) => {
    setSelectedService(service);
    setIsBrowseDesignsOpen(true);
  };

  const handleOpenAddDesign = (service: MasterService) => {
    setSelectedService(service);
    setIsAddDesignOpen(true);
  };

  const handleEditServiceDesign = (service: MasterService, serviceDesign: MasterServiceDesign) => {
    setSelectedService(service);
    setSelectedServiceDesign(serviceDesign);
    setIsEditServiceDesignOpen(true);
  };

  const handleSaveServiceDesign = async (updates: {
    customPrice?: number;
    additionalDuration?: number;
    notes?: string;
    isActive?: boolean;
  }) => {
    if (!selectedService || !selectedServiceDesign) return;

    try {
      await handleUpdateServiceDesign(
        selectedService.id,
        selectedServiceDesign.nailDesign.id,
        updates
      );
      setIsEditServiceDesignOpen(false);
      setSelectedServiceDesign(null);
    } catch (error) {
      throw error;
    }
  };

  const handleSelectDesign = async (design: NailDesign) => {
    if (!selectedService) return;

    try {
      if (!selectedService.id) {
        throw new Error('ID выбранной услуги не найден');
      }
      
      if (!design.id) {
        throw new Error('ID выбранного дизайна не найден');
      }
      
      // Стоимость дизайна в рамках услуги должна соответствовать стоимости услуги
      const customPrice = selectedService.price;
      const newServiceDesign = await masterService.addDesignToService(
        selectedService.id,
        design.id,
        {
          customPrice,
          additionalDuration: 0,
          notes: `Дизайн добавлен с ценой услуги ${customPrice}₽`
        }
      );

      if (!newServiceDesign) {
        throw new Error('Не удалось добавить дизайн к услуге');
      }

      setServiceDesigns(prev => ({
        ...prev,
        [selectedService.id]: [...(prev[selectedService.id] || []), newServiceDesign]
      }));

      toast.success(`Дизайн "${design.title}" добавлен к услуге за ${customPrice}₽`);
    } catch (error) {
      console.error('Ошибка добавления дизайна к услуге:', error);
      toast.error('Не удалось добавить дизайн к услуге');
    }
  };

  const handleCreateDesign = async (designData: any, serviceId?: string) => {
    try {
        const response = await designService.createNailDesign({
            ...designData,
            imageUrl: designData.imageUrl
        });
        
        if (response.success && response.data) {
            // Если дизайн создается в библиотеку - показываем успех и обновляем список
            if (!serviceId) {
                toast.success('Дизайн создан и отправлен на модерацию в общую библиотеку');
                setIsAddDesignOpen(false);
                // Обновляем список дизайнов во вкладке "Мои дизайны"
                await refreshMasterDesigns();
                return;
            }
            
            // Находим выбранную услугу
            const selectedServiceData = safeServices.find(s => s.id === serviceId);
            if (!selectedServiceData) {
                toast.error('Услуга не найдена');
                return;
            }
            const finalPrice = designData.estimatedPrice || selectedServiceData.price;
            
            try {
                console.log('Добавляем дизайн к услуге:', {
                    serviceId: selectedServiceData.id,
                    designId: response.data.id,
                    finalPrice
                });
                
                if (!selectedServiceData.id) {
                    throw new Error('ID выбранной услуги не найден');
                }
                
                if (!response.data.id) {
                    throw new Error('ID созданного дизайна не найден');
                }
                
                await masterService.addDesignToService(
                    selectedServiceData.id,
                    response.data.id,
                    {
                        customPrice: finalPrice,
                        additionalDuration: 0,
                        notes: `Новый дизайн создан для услуги "${selectedServiceData.name}"`
                    }
                );

                // Обновляем список дизайнов для этой услуги
                const updatedDesigns = await masterService.getServiceDesigns(selectedServiceData.id);
                console.log('Получен обновленный список дизайнов:', updatedDesigns);
                
                setServiceDesigns(prev => ({
                    ...prev,
                    [selectedServiceData.id]: updatedDesigns
                }));
                
                toast.success(`Дизайн создан и добавлен к услуге "${selectedServiceData.name}" за ${finalPrice}₽`);
                setIsAddDesignOpen(false);
                // Обновляем список дизайнов во вкладке "Мои дизайны"
                await refreshMasterDesigns();
            } catch (error) {
                console.error('Ошибка добавления дизайна к услуге:', error);
                toast.error(error.message || 'Дизайн создан, но не удалось добавить его к услуге');
                throw error;
            }
        } else {
            throw new Error('Не удалось создать дизайн');
        }
    } catch (error) {
        console.error('Ошибка создания дизайна:', error);
        throw error;
    }
  };

  const handleRemoveDesignFromService = async (serviceId: string, designId: string) => {
    try {
      await masterService.removeDesignFromService(serviceId, designId);
      setServiceDesigns(prev => ({
        ...prev,
        [serviceId]: prev[serviceId]?.filter(sd => sd.nailDesign.id !== designId) || []
      }));
      toast.success('Дизайн удален из услуги');
    } catch (error) {
      console.error('Ошибка удаления дизайна из услуги:', error);
      toast.error('Не удалось удалить дизайн из услуги');
    }
  };

  const handleUpdateServiceDesign = async (
    serviceId: string, 
    designId: string, 
    updates: { customPrice?: number; isActive?: boolean; additionalDuration?: number; notes?: string }
  ) => {
    try {
      const updatedServiceDesign = await masterService.updateServiceDesign(serviceId, designId, updates);
      setServiceDesigns(prev => ({
        ...prev,
        [serviceId]: prev[serviceId]?.map(sd => 
          sd.nailDesign.id === designId ? updatedServiceDesign : sd
        ) || []
      }));
      toast.success('Дизайн обновлен');
    } catch (error) {
      console.error('Ошибка обновления дизайна:', error);
      toast.error('Не удалось обновить дизайн');
    }
  };

  const handleAddDesign = async (designId: string) => {
    try {
      const newDesign = await masterService.addCanDoDesign(designId, {
        customPrice: 0,
        estimatedDuration: 60
      });
      setDesigns([...safeDesigns, newDesign]);
      toast.success('Дизайн добавлен');
    } catch (error) {
      console.error('Ошибка добавления дизайна:', error);
      toast.error('Не удалось добавить дизайн');
    }
  };

  const handleUpdateDesign = async (designId: string, updates: any) => {
    try {
      const updatedDesign = await masterService.updateMasterDesign(designId, updates);
      setDesigns(safeDesigns.map(design => 
        design.id === designId ? updatedDesign : design
      ));
      toast.success('Дизайн обновлен');
    } catch (error) {
      console.error('Ошибка обновления дизайна:', error);
      toast.error('Не удалось обновить дизайн');
    }
  };

  const handleRemoveDesign = async (designId: string) => {
    try {
      await masterService.removeCanDoDesign(designId);
      setDesigns(safeDesigns.filter(design => design.id !== designId));
      toast.success('Дизайн удален');
    } catch (error) {
      console.error('Ошибка удаления дизайна:', error);
      toast.error('Не удалось удалить дизайн');
    }
  };

  const refreshServiceDesigns = async (serviceId: string) => {
    try {
      console.log('Обновляем список дизайнов для услуги:', serviceId);
      const designs = await masterService.getServiceDesigns(serviceId);
      console.log('Получены обновленные дизайны:', designs);
      
      setServiceDesigns(prev => ({
        ...prev,
        [serviceId]: designs
      }));
    } catch (error) {
      console.error('Ошибка при обновлении списка дизайнов:', error);
    }
  };

  const safeDesigns = designs || [];
  const safeServices = services || [];

  const handleAddDesignClick = () => {
    // Открываем модальное окно - выбор услуги будет внутри
    setIsAddDesignOpen(true);
  };

  // Функция для обновления списка дизайнов мастера
  const refreshMasterDesigns = async () => {
    if (!currentUser?.id) return;
    
    try {
      const designsResponse = await designService.getMasterDesigns(currentUser.id);
      if (designsResponse.success && designsResponse.data) {
        const masterDesigns: MasterDesign[] = designsResponse.data.map(design => ({
          id: design.id,
          nailDesign: design,
          isActive: design.isActive,
          customPrice: design.estimatedPrice || 0,
          estimatedDuration: 60, // значение по умолчанию
          addedAt: design.createdAt
        }));
        setDesigns(masterDesigns);
      }
    } catch (error) {
      console.error('Ошибка обновления дизайнов:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Кабинет мастера</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="max-w-md lg:max-w-6xl mx-auto lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Master Profile Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative h-20 gradient-bg"></div>
              <CardContent className="relative p-6 -mt-10">
                <div className="flex items-end gap-4 mb-4">
                  <AvatarUpload
                    currentAvatar={currentUser.avatar}
                    userName={masterData.fullName || currentUser.email}
                    size="lg"
                    showUploadButton={true}
                    onAvatarUpdate={(newAvatarUrl) => {
                      console.log('Аватар обновлен в MasterDashboard:', newAvatarUrl);
                    }}
                  />
                  
                  <div className="flex-1 pb-2">
                    <h2 className="text-xl font-bold mb-1">{masterData.fullName || 'Мастер маникюра'}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{masterData.rating || 0}</span>
                      <span className="text-muted-foreground text-sm">({masterData.reviewsCount || 0} отзывов)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{masterData.address || 'Адрес не указан'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{stats?.canDoDesignsCount || safeDesigns.length}</p>
                    <p className="text-xs text-muted-foreground">Дизайнов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{stats?.servicesCount || safeServices.length}</p>
                    <p className="text-xs text-muted-foreground">Услуг</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {(masterData.specialties || []).map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mb-2" onClick={handleEditProfile}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать профиль
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={() => navigate(`/master/${masterData.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Просмотр профиля
                </Button>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.todayEarnings}₽</p>
                    <p className="text-xs text-muted-foreground">Сегодня</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.todayClients}</p>
                    <p className="text-xs text-muted-foreground">Клиентов сегодня</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.monthlyEarnings}₽</p>
                    <p className="text-xs text-muted-foreground">За месяц</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab("orders")}
                >
                  <CardContent className="p-4 text-center relative">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                    <p className="text-xs text-muted-foreground">Ожидает ответа</p>
                    {stats.pendingRequests > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{stats.completedBookings}</p>
                    <p className="text-xs text-muted-foreground">Выполнено</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                    <p className="text-xs text-muted-foreground">Подтверждено</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Рейтинг</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{stats.monthlyClients}</p>
                    <p className="text-xs text-muted-foreground">Клиентов за месяц</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="services" className="w-full" onValueChange={(value) => setActiveTab(value as "services" | "designs" | "orders")}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="h-11">
                  <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Мои услуги ({safeServices.length})
                  </TabsTrigger>
                  <TabsTrigger value="designs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Palette className="w-4 h-4 mr-2" />
                    Мои дизайны ({safeDesigns.length})
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Заказы
                  </TabsTrigger>
                </TabsList>
                {activeTab === "services" ? (
                  <Button size="sm" onClick={() => setIsAddServiceModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить услугу
                  </Button>
                ) : activeTab === "designs" ? (
                  <Button size="sm" onClick={handleAddDesignClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить дизайн
                  </Button>
                ) : null}
              </div>

              <TabsContent value="services" className="space-y-4 mt-0">
                {safeServices.map((service) => (
                  <Card key={service?.id || 'temp'}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{service?.name || 'Без названия'}</h4>
                          <p className="text-sm text-muted-foreground">{service?.description || 'Описание отсутствует'}</p>
                        </div>
                        <Badge variant={service?.isActive ? "default" : "secondary"}>
                          {service?.isActive ? "Активна" : "Неактивна"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-primary">{service?.price || 0}₽</span>
                        <span className="text-sm text-muted-foreground">{service?.duration || 0} мин</span>
                      </div>

                      {/* Дизайны услуги */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium">
                            Дизайны ({serviceDesigns[service?.id || '']?.length || 0})
                          </h5>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => service && handleOpenBrowseDesigns(service)}
                            >
                              <Search className="w-3 h-3 mr-1" />
                              Выбрать
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => service && handleOpenAddDesign(service)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Создать
                            </Button>
                          </div>
                        </div>
                        
                        {serviceDesigns[service?.id || '']?.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {serviceDesigns[service?.id || '']?.slice(0, 6).map((serviceDesign) => (
                              serviceDesign && serviceDesign.nailDesign ? (
                                <div key={serviceDesign.id} className="relative group">
                                  <img 
                                    src={getImageUrl(serviceDesign.nailDesign?.imageUrl) || '/placeholder.svg'} 
                                    alt={serviceDesign.nailDesign?.title}
                                    className={`w-full aspect-square object-cover rounded border ${!serviceDesign.nailDesign?.isModerated ? 'opacity-70' : ''}`}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors rounded flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => service && handleEditServiceDesign(service, serviceDesign)}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => service && handleRemoveDesignFromService(service.id, serviceDesign.nailDesign.id)}
                                      >
                                        <XCircle className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-1 left-1 bg-black/75 text-white text-xs px-1 rounded">
                                    {serviceDesign.customPrice || service?.price || 0}₽
                                  </div>
                                  {!serviceDesign.isActive && (
                                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
                                      Неактивен
                                    </div>
                                  )}
                                  {!serviceDesign.nailDesign?.isModerated && (
                                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 rounded">
                                      На модерации
                                    </div>
                                  )}
                                  {serviceDesign.nailDesign?.isModerated && !serviceDesign.nailDesign?.isActive && (
                                    <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 rounded">
                                      Отклонен
                                    </div>
                                  )}
                                </div>
                              ) : null
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Дизайны не добавлены</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => service?.id && handleUpdateService(service.id, { isActive: !service.isActive })}
                        >
                          {service?.isActive ? "Деактивировать" : "Активировать"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => service?.id && handleDeleteService(service.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="designs" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeDesigns.map((design) => (
                    <Card key={design.id} className="overflow-hidden">
                      <div className="relative">
                        <img 
                          src={getImageUrl(design.nailDesign?.imageUrl) || '/placeholder.svg'} 
                          alt={design.nailDesign?.title || 'Дизайн ногтей'}
                          className={`w-full h-48 object-cover ${!design.nailDesign?.isModerated ? 'opacity-70' : ''}`}
                        />
                        {!design.nailDesign?.isModerated && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                            На модерации
                          </div>
                        )}
                        {design.nailDesign?.isModerated && !design.nailDesign?.isActive && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Отклонен
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{design.nailDesign?.title || 'Без названия'}</h4>
                            <p className="text-sm text-muted-foreground">{design.nailDesign?.type || 'basic'}</p>
                          </div>
                          <Badge variant={design.isActive ? "default" : "secondary"}>
                            {design.isActive ? "Активен" : "Неактивен"}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-3">
                          <span className="font-semibold text-primary">
                            {design.customPrice || design.nailDesign?.estimatedPrice || 0}₽
                          </span>
                          <span className="text-muted-foreground">{design.estimatedDuration || 0} мин</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateDesign(design.id, { isActive: !design.isActive })}
                          >
                            {design.isActive ? "Деактивировать" : "Активировать"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleRemoveDesign(design.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4 mt-0">
                <MasterOrdersTab masterId={masterData.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onSubmit={handleAddService}
      />

      {selectedService && (
        <>
          <BrowseDesignsModal
            isOpen={isBrowseDesignsOpen}
            onClose={() => {
              setIsBrowseDesignsOpen(false);
              setSelectedService(null);
            }}
            onSelectDesign={handleSelectDesign}
            serviceId={selectedService.id}
            serviceName={selectedService.name}
            servicePrice={selectedService.price}
          />

        </>
      )}

      <AddDesignModal
        isOpen={isAddDesignOpen}
        onClose={() => {
          setIsAddDesignOpen(false);
        }}
        onSubmit={handleCreateDesign}
        services={safeServices.map(service => ({
          id: service.id,
          name: service.name,
          price: service.price
        }))}
      />

      {selectedService && selectedServiceDesign && (
        <EditServiceDesignModal
          isOpen={isEditServiceDesignOpen}
          onClose={() => {
            setIsEditServiceDesignOpen(false);
            setSelectedServiceDesign(null);
          }}
          onSave={handleSaveServiceDesign}
          serviceDesign={selectedServiceDesign}
          serviceName={selectedService.name}
          baseServicePrice={selectedService.price}
        />
      )}
    </div>
  );
};

export default MasterDashboard;
