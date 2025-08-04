import { Request, Response } from 'express';
import { AppDataSource } from '../conf/orm.conf';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { MasterDesignEntity } from '../entities/master-design.entity';
import { NailDesignEntity } from '../entities/nail-design.entity';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api.type';
import { Like } from 'typeorm';
import { getRepository } from 'typeorm';
import { MasterServiceEntity } from '../entities/master-service.entity';
import { ResponseUtil } from '../utils/response.util';
import { MasterServiceDesignEntity } from '../entities/master-service-design.entity';
import { UserEntity } from '../entities/user.entity';
import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { MoreThanOrEqual } from 'typeorm';
import { MasterRatingEntity } from '../entities';
import { validate as uuidValidate } from 'uuid';
import { instanceToInstance, instanceToPlain } from 'class-transformer';
import { JwtUtil } from '../utils/jwt.util';
import { AuthResponse } from '../types/api.type';

export class MasterController {
    /**
     * Валидация UUID формата
     */
    private static validateUUID(value: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }
    /**
     * Добавить дизайн в список "Я так могу"
     */
    static async addCanDoDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { designId } = req.params;
            const { customPrice, notes, estimatedDuration } = req.body;

            // Проверяем, что пользователь - мастер
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: userId } });

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем существование дизайна
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = await designRepository.findOne({ 
                where: { id: designId, isActive: true, isModerated: true } 
            });

            if (!design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден или не одобрен'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем, не добавлен ли уже этот дизайн
            const masterDesignRepository = AppDataSource.getRepository(MasterDesignEntity);
            const existingMasterDesign = await masterDesignRepository.findOne({
                where: { 
                    nailMaster: { id: userId },
                    nailDesign: { id: designId }
                }
            });

            if (existingMasterDesign) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн уже добавлен в ваш список'
                };
                res.status(409).json(response);
                return;
            }

            // Создаем связь
            const masterDesign = new MasterDesignEntity();
            masterDesign.nailMaster = master;
            masterDesign.nailDesign = design;
            masterDesign.customPrice = customPrice;
            masterDesign.notes = notes;
            masterDesign.estimatedDuration = estimatedDuration;

            const savedMasterDesign = await masterDesignRepository.save(masterDesign);

            const response: ApiResponse<MasterDesignEntity> = {
                success: true,
                data: savedMasterDesign,
                message: 'Дизайн добавлен в список "Я так могу"'
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Ошибка добавления дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Удалить дизайн из списка "Я так могу"
     */
    static async removeCanDoDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { designId } = req.params;

            const masterDesignRepository = AppDataSource.getRepository(MasterDesignEntity);
            const masterDesign = await masterDesignRepository.findOne({
                where: { 
                    nailMaster: { id: userId },
                    nailDesign: { id: designId }
                }
            });

            if (!masterDesign) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден в вашем списке'
                };
                res.status(404).json(response);
                return;
            }

            await masterDesignRepository.remove(masterDesign);

            const response: ApiResponse = {
                success: true,
                message: 'Дизайн удален из списка "Я так могу"'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка удаления дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить дизайны мастера (которые он может выполнить)
     */
    static async getMasterDesigns(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const masterDesignRepository = AppDataSource.getRepository(MasterDesignEntity);
            const [masterDesigns, total] = await masterDesignRepository.findAndCount({
                where: { 
                    nailMaster: { id: userId },
                    isActive: true
                },
                relations: ['nailDesign'],
                order: { addedAt: 'DESC' },
                skip,
                take: limit
            });

            const response: PaginatedResponse<MasterDesignEntity> = {
                success: true,
                data: masterDesigns,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения дизайнов мастера:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Обновить информацию о дизайне в списке мастера
     */
    static async updateMasterDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { designId } = req.params;
            const { customPrice, notes, estimatedDuration, isActive } = req.body;

            const masterDesignRepository = AppDataSource.getRepository(MasterDesignEntity);
            const masterDesign = await masterDesignRepository.findOne({
                where: { 
                    nailMaster: { id: userId },
                    nailDesign: { id: designId }
                }
            });

            if (!masterDesign) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден в вашем списке'
                };
                res.status(404).json(response);
                return;
            }

            // Обновляем только переданные поля
            if (customPrice !== undefined) masterDesign.customPrice = customPrice;
            if (notes !== undefined) masterDesign.notes = notes;
            if (estimatedDuration !== undefined) masterDesign.estimatedDuration = estimatedDuration;
            if (isActive !== undefined) masterDesign.isActive = isActive;

            const updatedMasterDesign = await masterDesignRepository.save(masterDesign);

            const response: ApiResponse<MasterDesignEntity> = {
                success: true,
                data: updatedMasterDesign,
                message: 'Информация о дизайне обновлена'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка обновления дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить профиль мастера
     */
    static async getMasterProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // Если есть параметр id, то ищем по нему, иначе используем userId из токена
            const targetId = id || req.userId!;

            if (!id && !req.userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходима авторизация для получения собственного профиля'
                };
                res.status(401).json(response);
                return;
            }

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({
                where: { id: targetId, isActive: true },
                relations: ['designs', 'designs.nailDesign']
            });

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Скрываем пароль
            const { password, ...masterData } = master;

            const response: ApiResponse<Partial<NailMasterEntity>> = {
                success: true,
                data: masterData
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения профиля мастера:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Обновить профиль мастера
     */
    static async updateMasterProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const {
                fullName,
                phone,
                address,
                description,
                latitude,
                longitude
            } = req.body;

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: userId } });

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем уникальность телефона, если он изменился
            if (phone && phone !== master.phone) {
                const existingMaster = await masterRepository.findOne({ where: { phone } });
                if (existingMaster) {
                    const response: ApiResponse = {
                        success: false,
                        error: 'Мастер с таким номером телефона уже существует'
                    };
                    res.status(409).json(response);
                    return;
                }
            }

            // Обновляем только переданные поля
            if (fullName !== undefined) master.fullName = fullName;
            if (phone !== undefined) master.phone = phone;
            if (address !== undefined) master.address = address;
            if (description !== undefined) master.description = description;
            if (latitude !== undefined) master.latitude = latitude;
            if (longitude !== undefined) master.longitude = longitude;

            const updatedMaster = await masterRepository.save(master);

            // Генерируем новые токены с обновленными данными
            const tokenPayload = {
                userId: updatedMaster.id,
                email: updatedMaster.email,
                username: updatedMaster.username,
                role: updatedMaster.role,
                isGuest: updatedMaster.isGuest,
                fullName: updatedMaster.fullName,
                phone: updatedMaster.phone,
                avatar: (updatedMaster as any).avatar
            };

            const accessToken = JwtUtil.generateAccessToken(tokenPayload);
            const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

            // Скрываем пароль
            const { password, ...masterData } = updatedMaster;

            const authResponse: AuthResponse = {
                user: {
                    id: updatedMaster.id,
                    email: updatedMaster.email,
                    username: updatedMaster.username,
                    role: updatedMaster.role,
                    fullName: updatedMaster.fullName,
                    isGuest: updatedMaster.isGuest,
                    avatar: (updatedMaster as any).avatar
                },
                token: accessToken,
                refreshToken: refreshToken
            };

            const response: ApiResponse<AuthResponse> = {
                success: true,
                data: authResponse,
                message: 'Профиль мастера успешно обновлен. Новые токены сгенерированы.'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Найти мастеров по геолокации
     */
    static async findNearbyMasters(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const latitude = parseFloat(req.query.latitude as string);
            const longitude = parseFloat(req.query.longitude as string);
            const radius = parseInt(req.query.radius as string) || 10; // км
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            if (isNaN(latitude) || isNaN(longitude)) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Координаты обязательны'
                };
                res.status(400).json(response);
                return;
            }

            const skip = (page - 1) * limit;

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const masters = await masterRepository
                .createQueryBuilder('master')
                .addSelect(
                    `(6371 * acos(cos(radians(:latitude)) * cos(radians(master.latitude)) * cos(radians(master.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(master.latitude))))`,
                    'distance'
                )
                .where('master.isActive = :isActive', { isActive: true })
                .andWhere('master.latitude IS NOT NULL')
                .andWhere('master.longitude IS NOT NULL')
                .setParameters({ latitude, longitude })
                .having('distance <= :radius', { radius })
                .orderBy('distance', 'ASC')
                .addOrderBy('master.rating', 'DESC')
                .skip(skip)
                .take(limit)
                .getRawAndEntities();

            const response: ApiResponse<any> = {
                success: true,
                data: masters.entities.map((master, index) => ({
                    ...master,
                    distance: parseFloat(masters.raw[index].distance).toFixed(2)
                }))
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка поиска мастеров:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Поиск мастеров по имени или адресу
     */
    static async searchMasters(req: Request, res: Response): Promise<void> {
        try {
            const { query, limit = 10 } = req.query;
            
            if (!query || typeof query !== 'string') {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходимо указать поисковый запрос'
                };
                res.status(400).json(response);
                return;
            }

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            
            const masters = await masterRepository.find({
                where: [
                    { fullName: Like(`%${query}%`) },
                    { address: Like(`%${query}%`) },
                    { username: Like(`%${query}%`) }
                ],
                take: Math.min(parseInt(limit as string) || 10, 50),
                order: {
                    rating: 'DESC'
                }
            });

            const response: ApiResponse = {
                success: true,
                data: { masters }
            };
            res.json(response);
        } catch (error) {
            console.error('Ошибка при поиске мастеров:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Ошибка при поиске мастеров'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получение статистики мастера
     */
    static async getMasterStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const masterId = req.userId;
            
            if (!masterId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Не удалось определить ID мастера'
                };
                res.status(401).json(response);
                return;
            }

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const masterDesignRepository = AppDataSource.getRepository(MasterDesignEntity);
            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const masterServiceRepository = AppDataSource.getRepository(MasterServiceEntity);
            
            // Получаем мастера
            const master = await masterRepository.findOne({
                where: { id: masterId }
            });

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Получаем текущую дату и начало дня
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Получаем статистику заказов
            const [
                // Сегодняшние заказы
                todayOrders,
                // Месячные заказы
                monthlyOrders,
                // Ожидающие заказы
                pendingOrders,
                // Подтвержденные заказы
                confirmedOrders,
                // Завершенные заказы
                completedOrders,
                // Количество дизайнов "Я так могу"
                canDoDesignsCount,
                // Количество услуг
                servicesCount
            ] = await Promise.all([
                // Заказы на сегодня
                orderRepository.find({
                    where: { 
                        nailMaster: { id: masterId },
                        status: OrderStatus.COMPLETED,
                        completedAt: MoreThanOrEqual(startOfToday)
                    }
                }),
                // Заказы за месяц
                orderRepository.find({
                    where: { 
                        nailMaster: { id: masterId },
                        status: OrderStatus.COMPLETED,
                        completedAt: MoreThanOrEqual(startOfMonth)
                    }
                }),
                // Ожидающие заказы
                orderRepository.count({
                    where: { 
                        nailMaster: { id: masterId },
                        status: OrderStatus.PENDING
                    }
                }),
                // Подтвержденные заказы
                orderRepository.count({
                    where: { 
                        nailMaster: { id: masterId },
                        status: OrderStatus.CONFIRMED
                    }
                }),
                // Завершенные заказы
                orderRepository.count({
                    where: { 
                        nailMaster: { id: masterId },
                        status: OrderStatus.COMPLETED
                    }
                }),
                // Количество дизайнов "Я так могу"
                masterDesignRepository.count({
                    where: { 
                        nailMaster: { id: masterId },
                        isActive: true
                    }
                }),
                // Количество услуг
                masterServiceRepository.count({
                    where: { 
                        master: { id: masterId },
                        isActive: true
                    }
                })
            ]);

            // Подсчитываем заработки
            const todayEarnings = todayOrders.reduce((sum, order) => sum + (Number(order.price) || 0), 0);
            const monthlyEarnings = monthlyOrders.reduce((sum, order) => sum + (Number(order.price) || 0), 0);

            // Подсчитываем количество уникальных клиентов
            const todayClients = new Set(todayOrders.map(order => order.client?.id)).size;
            const monthlyClients = new Set(monthlyOrders.map(order => order.client?.id)).size;

            // Формируем статистику
            const stats = {
                todayEarnings,
                monthlyEarnings,
                todayClients,
                monthlyClients,
                averageRating: Number(master.rating) || 0,
                completedBookings: completedOrders,
                pendingRequests: pendingOrders,
                confirmedBookings: confirmedOrders,
                canDoDesignsCount,
                servicesCount,
                totalOrders: master.totalOrders || 0,
                reviewsCount: master.reviewsCount || 0
            };

            const response: ApiResponse = {
                success: true,
                data: stats
            };
            res.json(response);
        } catch (error) {
            console.error('Ошибка при получении статистики мастера:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Ошибка при получении статистики мастера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить всех мастеров
     */
    static async getAllMasters(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const [masters, total] = await masterRepository.findAndCount({
                where: { isGuest: false },
                order: { 
                    rating: 'DESC',
                    createdAt: 'DESC'
                },
                skip,
                take: limit
            });

            // Преобразуем результаты в правильный формат для фронтенда
            const formattedMasters = masters.map(master => ({
                id: master.id,
                email: master.email,
                username: master.username,
                role: master.role,
                fullName: master.fullName,
                phone: master.phone,
                avatar: master.avatar_url,
                address: master.address,
                description: master.description,
                rating: Number(master.rating) || 0, // Преобразуем в число
                reviewsCount: master.reviewsCount || 0,
                totalOrders: master.totalOrders || 0,
                experience: `${master.totalOrders || 0} заказов`, // Добавляем поле experience
                designs: 0, // Заглушка для количества дизайнов
                uploadsCount: 0, // Заглушка для количества загрузок
                specialties: Array.isArray(master.specialties) 
                    ? master.specialties 
                    : (typeof master.specialties === 'string' 
                        ? (master.specialties as string).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
                        : []
                    ),
                latitude: master.latitude,
                longitude: master.longitude,
                startingPrice: master.startingPrice,
                isModerated: master.isModerated
            }));

            const response: PaginatedResponse<any> = {
                success: true,
                data: formattedMasters,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения мастеров:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить популярных мастеров
     */
    static async getPopularMasters(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 8;
            
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const masters = await masterRepository.find({
                where: { 
                    isActive: true 
                },
                order: { 
                    rating: 'DESC',
                    totalOrders: 'DESC' 
                },
                take: limit
            });

            // Преобразуем результаты в правильный формат для фронтенда
            const formattedMasters = masters.map(master => ({
                id: master.id,
                email: master.email,
                username: master.username,
                role: master.role,
                fullName: master.fullName,
                phone: master.phone,
                avatar: master.avatar_url,
                address: master.address,
                description: master.description,
                rating: Number(master.rating) || 0, // Преобразуем в число
                reviewsCount: master.reviewsCount || 0,
                totalOrders: master.totalOrders || 0,
                experience: `${master.totalOrders || 0} заказов`, // Добавляем поле experience
                designs: 0, // Заглушка для количества дизайнов
                uploadsCount: 0, // Заглушка для количества загрузок
                specialties: Array.isArray(master.specialties) 
                    ? master.specialties 
                    : (typeof master.specialties === 'string' 
                        ? (master.specialties as string).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
                        : []
                    ),
                latitude: master.latitude,
                longitude: master.longitude,
                startingPrice: master.startingPrice,
                isModerated: master.isModerated
            }));

            const response: ApiResponse<any[]> = {
                success: true,
                data: formattedMasters
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения популярных мастеров:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить услуги мастера
     */
    static async getMasterServices(req: Request, res: Response): Promise<void> {
        try {
            const { masterId } = req.params;
            console.log('Getting services for master:', masterId);
            
            const serviceRepository = AppDataSource.getRepository(MasterServiceEntity);
            
            const services = await serviceRepository.find({
                where: { master: { id: masterId } },
                relations: ['master'],
                order: { createdAt: 'DESC' }
            });

            const response = {
                success: true,
                data: services,
                message: 'Услуги мастера получены'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения услуг мастера:', error);
            res.status(500).json({
                success: false,
                error: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Добавить новую услугу мастера
     */
    static async addMasterService(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { masterId } = req.params;
            const { name, description, price, duration, isActive = true } = req.body;

            console.log('addMasterService called with:', {
                masterId,
                userId: req.userId,
                body: { name, description, price, duration, isActive }
            });

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: masterId } });

            console.log('Found master:', master ? { id: master.id, email: master.email } : null);

            if (!master) {
                console.log('Master not found');
                ResponseUtil.error(res, 'Мастер не найден', 404);
                return;
            }

            // Проверяем, что мастер редактирует свои услуги
            // Поскольку NailMasterEntity наследуется от UserEntity, 
            // нужно проверить, что masterId соответствует userId из токена
            // Для этого проверим, принадлежит ли этот мастер текущему пользователю
            console.log('Checking permissions:', {
                masterId: master.id,
                userId: req.userId,
                directMatch: master.id === req.userId
            });

            // Проверяем два варианта:
            // 1. Прямое совпадение ID (если в токене записан ID мастера)
            // 2. Проверяем через связь с UserEntity (если в токене записан базовый ID пользователя)
            let hasPermission = master.id === req.userId;
            
            console.log('Direct ID match result:', hasPermission);
            
            if (!hasPermission) {
                // Дополнительная проверка: возможно в токене записан базовый ID пользователя
                // Проверим, что мастер с данным ID принадлежит пользователю с userId из токена
                const userRepository = AppDataSource.getRepository(UserEntity);
                const user = await userRepository.findOne({ where: { id: req.userId } });
                
                console.log('Checking user from token:', user ? { id: user.id, email: user.email } : null);
                
                if (user && user.email === master.email) {
                    hasPermission = true;
                    console.log('Permission granted through email match');
                } else {
                    console.log('Email match failed:', {
                        userEmail: user?.email,
                        masterEmail: master.email,
                        match: user?.email === master.email
                    });
                }
            }

            console.log('Final permission result:', hasPermission);

            if (!hasPermission) {
                console.log('Permission denied: master does not belong to current user');
                ResponseUtil.error(res, 'Нет прав для добавления услуги', 403);
                return;
            }

            const serviceRepository = AppDataSource.getRepository(MasterServiceEntity);
            const service = new MasterServiceEntity();
            service.name = name;
            service.description = description;
            service.price = price;
            service.duration = duration;
            service.isActive = isActive;
            service.master = master;

            console.log('Creating service:', {
                name: service.name,
                price: service.price,
                duration: service.duration,
                isActive: service.isActive
            });

            const savedService = await serviceRepository.save(service);
            console.log('Service saved successfully:', { id: savedService.id });
            
            ResponseUtil.success(res, 'Услуга успешно добавлена', savedService);
        } catch (error) {
            console.error('Ошибка добавления услуги:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Обновить услугу мастера
     */
    static async updateMasterService(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { serviceId } = req.params;
            const updates = req.body;

            const serviceRepository = AppDataSource.getRepository(MasterServiceEntity);
            const service = await serviceRepository.findOne({ 
                where: { id: serviceId },
                relations: ['master']
            });

            if (!service) {
                ResponseUtil.error(res, 'Услуга не найдена', 404);
                return;
            }

            // Проверяем права доступа
            let hasPermission = service.master.id === req.userId;
            
            if (!hasPermission) {
                // Дополнительная проверка через email
                const userRepository = AppDataSource.getRepository(UserEntity);
                const user = await userRepository.findOne({ where: { id: req.userId } });
                
                if (user && user.email === service.master.email) {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                ResponseUtil.error(res, 'Нет прав для редактирования этой услуги', 403);
                return;
            }

            Object.assign(service, updates);
            const updatedService = await serviceRepository.save(service);
            ResponseUtil.success(res, 'Услуга успешно обновлена', updatedService);
        } catch (error) {
            console.error('Ошибка обновления услуги:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Удалить услугу мастера
     */
    static async deleteMasterService(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { serviceId } = req.params;
            const serviceRepository = AppDataSource.getRepository(MasterServiceEntity);
            const service = await serviceRepository.findOne({ 
                where: { id: serviceId },
                relations: ['master']
            });

            if (!service) {
                ResponseUtil.error(res, 'Услуга не найдена', 404);
                return;
            }

            // Проверяем права доступа
            let hasPermission = service.master.id === req.userId;
            
            if (!hasPermission) {
                // Дополнительная проверка через email
                const userRepository = AppDataSource.getRepository(UserEntity);
                const user = await userRepository.findOne({ where: { id: req.userId } });
                
                if (user && user.email === service.master.email) {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                ResponseUtil.error(res, 'Нет прав для удаления этой услуги', 403);
                return;
            }

            await serviceRepository.remove(service);
            ResponseUtil.success(res, 'Услуга успешно удалена');
        } catch (error) {
            console.error('Ошибка удаления услуги:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Получить дизайны для конкретной услуги мастера
     */
    static async getServiceDesigns(req: Request, res: Response): Promise<void> {
        try {
            const { serviceId } = req.params;
            
            const serviceDesignRepository = AppDataSource.getRepository(MasterServiceDesignEntity);
            const serviceDesigns = await serviceDesignRepository.find({
                where: { 
                    masterService: { id: serviceId }
                },
                relations: ['nailDesign', 'masterService'],
                order: { createdAt: 'DESC' }
            });

            const response: ApiResponse<MasterServiceDesignEntity[]> = {
                success: true,
                data: serviceDesigns
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения дизайнов услуги:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Добавить дизайн к услуге мастера
     */
    static async addDesignToService(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { serviceId, designId } = req.params;
            const { customPrice, additionalDuration, notes } = req.body;

            // Валидация UUID формата для serviceId и designId
            if (!MasterController.validateUUID(serviceId)) {
                console.log('Невалидный UUID для serviceId:', serviceId);
                ResponseUtil.error(res, 'Невалидный идентификатор услуги', 400);
                return;
            }
            
            if (!MasterController.validateUUID(designId)) {
                console.log('Невалидный UUID для designId:', designId);
                ResponseUtil.error(res, 'Невалидный идентификатор дизайна', 400);
                return;
            }

            console.log('Добавление дизайна к услуге:', {
                userId,
                serviceId,
                designId,
                body: req.body
            });

            // Проверяем, что услуга принадлежит мастеру
            const serviceRepository = AppDataSource.getRepository(MasterServiceEntity);
            const service = await serviceRepository.findOne({
                where: { id: serviceId },
                relations: ['master']
            });

            console.log('Найденная услуга:', service);

            if (!service) {
                console.log('Услуга не найдена');
                ResponseUtil.error(res, 'Услуга не найдена', 404);
                return;
            }

            // Проверяем права доступа
            let hasPermission = service.master.id === userId;
            
            if (!hasPermission) {
                // Дополнительная проверка через email
                const userRepository = AppDataSource.getRepository(UserEntity);
                const user = await userRepository.findOne({ where: { id: userId } });
                
                if (user && user.email === service.master.email) {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                console.log('Нет прав для редактирования услуги:', {
                    serviceOwnerId: service.master.id,
                    requestUserId: userId
                });
                ResponseUtil.error(res, 'Нет прав для редактирования этой услуги', 403);
                return;
            }

            // Проверяем существование дизайна
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = await designRepository.findOne({ 
                where: { id: designId }
            });

            console.log('Найденный дизайн:', design);

            if (!design) {
                console.log('Дизайн не найден');
                ResponseUtil.error(res, 'Дизайн не найден', 404);
                return;
            }

            // Проверяем, не добавлен ли уже этот дизайн к услуге
            const serviceDesignRepository = AppDataSource.getRepository(MasterServiceDesignEntity);
            const existingServiceDesign = await serviceDesignRepository.findOne({
                where: { 
                    masterService: { id: serviceId },
                    nailDesign: { id: designId }
                }
            });

            console.log('Существующий дизайн услуги:', existingServiceDesign);

            if (existingServiceDesign) {
                console.log('Дизайн уже добавлен к услуге');
                ResponseUtil.error(res, 'Дизайн уже добавлен к этой услуге', 409);
                return;
            }

            // Создаем связь
            const serviceDesign = new MasterServiceDesignEntity();
            serviceDesign.masterService = service;
            serviceDesign.nailDesign = design;
            // customPrice теперь хранит только дополнительную стоимость дизайна
            serviceDesign.customPrice = customPrice || 0;
            serviceDesign.additionalDuration = additionalDuration || 0;
            serviceDesign.notes = notes || '';
            serviceDesign.isActive = true;

            console.log('Создаваемый дизайн услуги:', serviceDesign);

            const savedServiceDesign = await serviceDesignRepository.save(serviceDesign);

            console.log('Сохраненный дизайн услуги:', savedServiceDesign);

            ResponseUtil.success(res, 'Дизайн добавлен к услуге', savedServiceDesign);
        } catch (error) {
            console.error('Ошибка добавления дизайна к услуге:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Удалить дизайн из услуги мастера
     */
    static async removeDesignFromService(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { serviceId, designId } = req.params;

            // Валидация UUID формата для serviceId и designId
            if (!MasterController.validateUUID(serviceId)) {
                console.log('Невалидный UUID для serviceId:', serviceId);
                ResponseUtil.error(res, 'Невалидный идентификатор услуги', 400);
                return;
            }
            
            if (!MasterController.validateUUID(designId)) {
                console.log('Невалидный UUID для designId:', designId);
                ResponseUtil.error(res, 'Невалидный идентификатор дизайна', 400);
                return;
            }

            const serviceDesignRepository = AppDataSource.getRepository(MasterServiceDesignEntity);
            const serviceDesign = await serviceDesignRepository.findOne({
                where: { 
                    masterService: { id: serviceId },
                    nailDesign: { id: designId }
                },
                relations: ['masterService', 'masterService.master']
            });

            if (!serviceDesign) {
                ResponseUtil.error(res, 'Дизайн не найден в этой услуге', 404);
                return;
            }

            // Проверяем права доступа
            let hasPermission = serviceDesign.masterService.master.id === userId;
            
            if (!hasPermission) {
                // Дополнительная проверка через email
                const userRepository = AppDataSource.getRepository(UserEntity);
                const user = await userRepository.findOne({ where: { id: userId } });
                
                if (user && user.email === serviceDesign.masterService.master.email) {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                ResponseUtil.error(res, 'Нет прав для редактирования этой услуги', 403);
                return;
            }

            await serviceDesignRepository.remove(serviceDesign);
            ResponseUtil.success(res, 'Дизайн удален из услуги');
        } catch (error) {
            console.error('Ошибка удаления дизайна из услуги:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Обновить информацию о дизайне в услуге
     */
    static async updateServiceDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { serviceId, designId } = req.params;
            const { customPrice, additionalDuration, notes, isActive } = req.body;

            // Валидация UUID формата для serviceId и designId
            if (!MasterController.validateUUID(serviceId)) {
                console.log('Невалидный UUID для serviceId:', serviceId);
                ResponseUtil.error(res, 'Невалидный идентификатор услуги', 400);
                return;
            }
            
            if (!MasterController.validateUUID(designId)) {
                console.log('Невалидный UUID для designId:', designId);
                ResponseUtil.error(res, 'Невалидный идентификатор дизайна', 400);
                return;
            }

            const serviceDesignRepository = AppDataSource.getRepository(MasterServiceDesignEntity);
            const serviceDesign = await serviceDesignRepository.findOne({
                where: { 
                    masterService: { id: serviceId },
                    nailDesign: { id: designId }
                },
                relations: ['masterService', 'masterService.master']
            });

            if (!serviceDesign) {
                ResponseUtil.error(res, 'Дизайн не найден в этой услуге', 404);
                return;
            }

            // Проверяем права доступа
            let hasPermission = serviceDesign.masterService.master.id === userId;
            
            if (!hasPermission) {
                // Дополнительная проверка через email
                const userRepository = AppDataSource.getRepository(UserEntity);
                const user = await userRepository.findOne({ where: { id: userId } });
                
                if (user && user.email === serviceDesign.masterService.master.email) {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                ResponseUtil.error(res, 'Нет прав для редактирования этой услуги', 403);
                return;
            }

            // Обновляем поля
            if (customPrice !== undefined) serviceDesign.customPrice = customPrice;
            if (additionalDuration !== undefined) serviceDesign.additionalDuration = additionalDuration;
            if (notes !== undefined) serviceDesign.notes = notes;
            if (isActive !== undefined) serviceDesign.isActive = isActive;

            const updatedServiceDesign = await serviceDesignRepository.save(serviceDesign);
            ResponseUtil.success(res, 'Информация о дизайне в услуге обновлена', updatedServiceDesign);
        } catch (error) {
            console.error('Ошибка обновления дизайна в услуге:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    static async getReviews(req: Request, res: Response): Promise<void> {
        try {
            const { masterId } = req.params;

            if(!uuidValidate(masterId)){
                const response: ApiResponse = {
                    success: false,
                    error: 'невалидный uuid мастера'
                };
                res.status(400).json(response);
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
            const existingMaster = masterRatingRepository.findOne({
                where: {id: masterId}
            })

            if (!existingMaster) {
                const response: ApiResponse = {
                    success: false,
                    error: 'мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            const [masterRatings, total] = await masterRatingRepository.findAndCount({
                where: {
                    nailMaster: { id: masterId }
                },
                relations: ['nailMaster', 'client'],
                order: { createdAt: 'DESC' },
                skip,
                take: limit
            });

            const sanitizedData = instanceToInstance(masterRatings);

            const response: PaginatedResponse<MasterRatingEntity> = {
                success: true,
                data: sanitizedData,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }

            res.json(response);

        } catch (error) {
            console.error('Ошибка получения отзывов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }
} 