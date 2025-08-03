import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { designService } from '@/services/designService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';

import DesignGallery from './components/DesignGallery';
import DesignInfo from './components/DesignInfo';
import DesignActions from './components/DesignActions';
import MasterInfo from './components/MasterInfo';
import styles from './design.page.module.css';

const DesignPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const { data: design, isLoading, error } = useQuery({
        queryKey: ['design', id],
        queryFn: () => designService.getDesignById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    const { data: mastersData } = useQuery({
        queryKey: ['design-masters', id],
        queryFn: () => designService.getMastersForDesign(id!),
        enabled: !!id && !!design?.data,
    });

    if (isLoading) {
        return (
            <div className={styles.container}>
                    <div className={styles.header}>
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    
                    <div className={styles.content}>
                        <div className={styles.gallery}>
                            <Skeleton className="w-full h-96 rounded-lg" />
                        </div>
                        
                        <div className={styles.info}>
                            <Skeleton className="h-8 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3 mb-4" />
                            <div className="flex gap-2 mb-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className={styles.backButton}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад
                    </Button>
                </div>
                
                <Card className={styles.errorCard}>
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
                        <p className="text-muted-foreground mb-4">
                            Не удалось загрузить информацию о дизайне
                        </p>
                        <Button onClick={() => navigate('/')}>
                            На главную
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!design?.data) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className={styles.backButton}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад
                    </Button>
                </div>
                
                <Card className={styles.errorCard}>
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold mb-2">Дизайн не найден</h2>
                        <p className="text-muted-foreground mb-4">
                            Запрашиваемый дизайн не существует или был удален
                        </p>
                        <Button onClick={() => navigate('/')}>
                            На главную
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const designData = design.data;

    return (
        <div className={styles.container}>
            <PageHeader
                title={designData.title}
                subtitle={`${designData.type === 'basic' ? 'Базовый' : 'Дизайнерский'} дизайн`}
                onBackClick={() => navigate(-1)}
            />

            <div className={styles.content}>
                    <div className={styles.gallery}>
                        <DesignGallery 
                            imageUrl={designData.imageUrl}
                            videoUrl={designData.videoUrl}
                            title={designData.title}
                        />
                    </div>

                    <div className={styles.sidebar}>
                        {!isAuthenticated && (
                            <Card className={styles.guestNotification}>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2">
                                        🎨 Больше возможностей для вас!
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Войдите или зарегистрируйтесь, чтобы сохранять понравившиеся дизайны и записываться к мастерам
                                    </p>
                                    <Button 
                                        size="sm" 
                                        onClick={() => navigate('/auth')}
                                        className="w-full"
                                    >
                                        Войти
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                        <DesignInfo design={designData} />
                        <DesignActions design={designData} />
                        
                    </div>
                </div>
            </div>
        
    );
};

export default DesignPage;