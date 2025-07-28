import { Response, Request } from 'express';
import { AppDataSource } from '../conf/orm.conf';
import { NailDesignEntity, DesignType, DesignSource } from '../entities/nail-design.entity';
import { ClientEntity } from '../entities/client.entity';
import { MasterDesignEntity } from '../entities/master-design.entity';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api.type';
import { Like, In } from 'typeorm';
import { getRepository, getConnection } from 'typeorm';
import { MasterServiceDesignEntity } from '../entities/master-service-design.entity';

export class NailDesignController {
    /**
     * Получить список дизайнов с пагинацией и фильтрами
     */
    static async getDesigns(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const type = req.query.type as DesignType;
            const source = req.query.source as DesignSource;
            const color = req.query.color as string;
            const tags = req.query.tags as string;
            const includeOwn = req.query.includeOwn === 'true';
            const userId = req.userId;
            
            const skip = (page - 1) * limit;
            
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const queryBuilder = designRepository.createQueryBuilder('design')
                .leftJoinAndSelect('design.uploadedByClient', 'uploadedByClient')
                .leftJoinAndSelect('design.uploadedByMaster', 'uploadedByMaster')
                .where('design.isActive = :isActive', { isActive: true });

            // Логика для модерации: показываем модерированные дизайны + свои собственные (если includeOwn = true)
            if (includeOwn && userId) {
                queryBuilder.andWhere(
                    '(design.isModerated = :isModerated OR design.uploadedByClient = :userId OR design.uploadedByMaster = :userId)',
                    { isModerated: true, userId }
                );
            } else {
                queryBuilder.andWhere('design.isModerated = :isModerated', { isModerated: true });
            }

            // Применяем фильтры
            if (type) {
                queryBuilder.andWhere('design.type = :type', { type });
            }
            
            if (source) {
                queryBuilder.andWhere('design.source = :source', { source });
            }
            
            if (color) {
                queryBuilder.andWhere('design.color ILIKE :color', { color: `%${color}%` });
            }
            
            if (tags) {
                const tagArray = tags.split(',').map(tag => tag.trim());
                // Используем JSON_EXTRACT_PATH_TEXT для проверки наличия тегов
                const conditions = tagArray.map((_, index) => `design.tags::text LIKE :tag${index}`).join(' OR ');
                const params: any = {};
                tagArray.forEach((tag, index) => {
                    params[`tag${index}`] = `%"${tag}"%`;
                });
                queryBuilder.andWhere(`(${conditions})`, params);
            }

            // Получаем общее количество и данные
            const [designs, total] = await queryBuilder
                .orderBy('design.likesCount', 'DESC')
                .addOrderBy('design.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            const response: PaginatedResponse<NailDesignEntity> = {
                success: true,
                data: designs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения дизайнов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить дизайн по ID
     */
    static async getDesignById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = await designRepository.findOne({
                where: { id, isActive: true },
                relations: ['uploadedByClient', 'uploadedByAdmin']
            });

            if (!design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден'
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse<NailDesignEntity> = {
                success: true,
                data: design
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Лайкнуть дизайн
     */
    static async likeDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId!;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходима аутентификация'
                };
                res.status(401).json(response);
                return;
            }

            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const clientRepository = AppDataSource.getRepository(ClientEntity);

            const design = await designRepository.findOne({ where: { id, isActive: true } });
            if (!design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден'
                };
                res.status(404).json(response);
                return;
            }

            const client = await clientRepository.findOne({
                where: { id: userId },
                relations: ['likedNailDesigns']
            });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Клиент не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем, лайкнул ли уже клиент этот дизайн
            const alreadyLiked = client.likedNailDesigns.some(d => d.id === id);
            
            if (alreadyLiked) {
                // Убираем лайк
                client.likedNailDesigns = client.likedNailDesigns.filter(d => d.id !== id);
                design.likesCount = Math.max(0, design.likesCount - 1);
            } else {
                // Добавляем лайк
                client.likedNailDesigns.push(design);
                design.likesCount += 1;
            }

            await clientRepository.save(client);
            await designRepository.save(design);

            const response: ApiResponse = {
                success: true,
                data: { isLiked: !alreadyLiked, likesCount: design.likesCount },
                message: alreadyLiked ? 'Лайк убран' : 'Лайк добавлен'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка лайка дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Создать новый дизайн (для клиентов и мастеров)
     */
    static async createDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const userRole = req.user!.role;
            const {
                title,
                description,
                imageUrl,
                videoUrl,
                type = DesignType.BASIC,
                tags,
                color,
                estimatedPrice
            } = req.body;

            if (!title || !imageUrl) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Название и изображение обязательны'
                };
                res.status(400).json(response);
                return;
            }

            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = new NailDesignEntity();
            
            design.title = title;
            design.description = description;
            design.imageUrl = imageUrl;
            design.videoUrl = videoUrl;
            design.type = type;
            design.tags = tags;
            design.color = color;
            design.estimatedPrice = estimatedPrice;
            design.isModerated = false; // Требует модерации

            // Устанавливаем источник и автора в зависимости от роли
            if (userRole === 'client') {
                design.source = DesignSource.CLIENT;
                design.uploadedByClient = { id: userId } as ClientEntity;
            } else if (userRole === 'nailmaster') {
                design.source = DesignSource.MASTER;
                design.uploadedByMaster = { id: userId } as NailMasterEntity;
            }

            const savedDesign = await designRepository.save(design);

            const response: ApiResponse<NailDesignEntity> = {
                success: true,
                data: savedDesign,
                message: 'Дизайн создан и отправлен на модерацию'
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Ошибка создания дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить мастеров и их услуги, которые могут выполнить дизайн
     */
    static async getMastersForDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const latitude = parseFloat(req.query.latitude as string);
            const longitude = parseFloat(req.query.longitude as string);
            const radius = parseInt(req.query.radius as string) || 10; // км

            // Используем новую систему связей через услуги
            const masterServiceDesignRepository = AppDataSource.getRepository(MasterServiceDesignEntity);
            
            let queryBuilder = masterServiceDesignRepository.createQueryBuilder('msd')
                .leftJoinAndSelect('msd.masterService', 'service')
                .leftJoinAndSelect('service.master', 'master')
                .leftJoinAndSelect('msd.nailDesign', 'design')
                .where('msd.nailDesign.id = :designId', { designId: id })
                .andWhere('msd.isActive = :isActive', { isActive: true })
                .andWhere('service.isActive = :serviceActive', { serviceActive: true })
                .andWhere('master.isActive = :masterActive', { masterActive: true });

            // Если указаны координаты, фильтруем по расстоянию
            if (!isNaN(latitude) && !isNaN(longitude)) {
                queryBuilder = queryBuilder
                    .addSelect(
                        `(6371 * acos(cos(radians(:latitude)) * cos(radians(master.latitude)) * cos(radians(master.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(master.latitude))))`,
                        'distance'
                    )
                    .setParameters({ latitude, longitude })
                    .having('distance <= :radius', { radius })
                    .orderBy('distance', 'ASC');
            } else {
                queryBuilder = queryBuilder.orderBy('master.rating', 'DESC');
            }

            const masterServiceDesigns = await queryBuilder.getMany();

            // Группируем данные по мастерам
            const mastersMap = new Map();
            
            masterServiceDesigns.forEach(msd => {
                const masterId = msd.masterService.master.id;
                
                if (!mastersMap.has(masterId)) {
                    mastersMap.set(masterId, {
                        master: msd.masterService.master,
                        services: []
                    });
                }
                
                const masterData = mastersMap.get(masterId);
                masterData.services.push({
                    id: msd.masterService.id,
                    name: msd.masterService.name,
                    description: msd.masterService.description,
                    basePrice: msd.masterService.price,
                    baseDuration: msd.masterService.duration,
                    customPrice: msd.customPrice,
                    additionalDuration: msd.additionalDuration,
                    totalPrice: msd.customPrice || msd.masterService.price,
                    totalDuration: (msd.masterService.duration + (msd.additionalDuration || 0)),
                    notes: msd.notes,
                    isActive: msd.isActive,
                    createdAt: msd.createdAt,
                    updatedAt: msd.updatedAt
                });
            });

            // Преобразуем в массив
            const mastersWithServices = Array.from(mastersMap.values());

            const response: ApiResponse<any[]> = {
                success: true,
                data: mastersWithServices
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
     * Получить все дизайны для админа (включая немодерированные)
     */
    static async getAllDesignsForAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const type = req.query.type as DesignType;
            const source = req.query.source as DesignSource;
            const isModerated = req.query.isModerated;
            const isActive = req.query.isActive;
            
            const skip = (page - 1) * limit;
            
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const queryBuilder = designRepository.createQueryBuilder('design');

            // Применяем фильтры
            if (type) {
                queryBuilder.andWhere('design.type = :type', { type });
            }
            
            if (source) {
                queryBuilder.andWhere('design.source = :source', { source });
            }

            if (isModerated !== undefined) {
                queryBuilder.andWhere('design.isModerated = :isModerated', { 
                    isModerated: isModerated === 'true' 
                });
            }

            if (isActive !== undefined) {
                queryBuilder.andWhere('design.isActive = :isActive', { 
                    isActive: isActive === 'true' 
                });
            }

            // Получаем общее количество и данные
            const [designs, total] = await queryBuilder
                .orderBy('design.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            const response: PaginatedResponse<NailDesignEntity> = {
                success: true,
                data: designs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения дизайнов для админа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Модерировать дизайн (одобрить/отклонить)
     */
    static async moderateDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isModerated, isActive } = req.body;

            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = await designRepository.findOne({ where: { id } });

            if (!design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Обновляем статус модерации
            if (isModerated !== undefined) {
                design.isModerated = isModerated;
            }

            if (isActive !== undefined) {
                design.isActive = isActive;
            }

            const updatedDesign = await designRepository.save(design);

            const response: ApiResponse<NailDesignEntity> = {
                success: true,
                data: updatedDesign,
                message: `Дизайн ${isModerated ? 'одобрен' : 'отклонен'}`
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка модерации дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Поиск дизайнов по названию или описанию
     */
    static async searchDesigns(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { query, limit = 12, type, page = 1, includeOwn } = req.query;
            const userId = req.userId;
            
            if (!query || typeof query !== 'string') {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходимо указать поисковый запрос'
                };
                res.status(400).json(response);
                return;
            }

            const pageNum = parseInt(page as string) || 1;
            const limitNum = Math.min(parseInt(limit as string) || 12, 50);
            const skip = (pageNum - 1) * limitNum;
            const includeOwnDesigns = includeOwn === 'true';

            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            
            // Используем QueryBuilder для более сложной логики
            const queryBuilder = designRepository.createQueryBuilder('design')
                .leftJoinAndSelect('design.uploadedByClient', 'uploadedByClient')
                .leftJoinAndSelect('design.uploadedByMaster', 'uploadedByMaster')
                .where('design.isActive = :isActive', { isActive: true })
                .andWhere('(design.title ILIKE :query OR design.description ILIKE :query)', { query: `%${query}%` });

            // Логика для модерации: показываем модерированные дизайны + свои собственные (если includeOwn = true)
            if (includeOwnDesigns && userId) {
                queryBuilder.andWhere(
                    '(design.isModerated = :isModerated OR design.uploadedByClient = :userId OR design.uploadedByMaster = :userId)',
                    { isModerated: true, userId }
                );
            } else {
                queryBuilder.andWhere('design.isModerated = :isModerated', { isModerated: true });
            }
            
            if (type && (type === 'basic' || type === 'designer')) {
                queryBuilder.andWhere('design.type = :type', { type });
            }

            queryBuilder
                .orderBy('design.likesCount', 'DESC')
                .addOrderBy('design.createdAt', 'DESC')
                .skip(skip)
                .take(limitNum);

            const [designs, total] = await queryBuilder.getManyAndCount();

            const response: PaginatedResponse<NailDesignEntity> = {
                success: true,
                data: designs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            };
            res.json(response);
        } catch (error) {
            console.error('Ошибка при поиске дизайнов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Ошибка при поиске дизайнов'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Обновить дизайн
     */
    static async updateDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId!;
            const userRole = req.user!.role;
            const updateData = req.body;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходима аутентификация'
                };
                res.status(401).json(response);
                return;
            }

            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = await designRepository.findOne({ 
                where: { id },
                relations: ['uploadedByClient', 'uploadedByAdmin']
            });

            if (!design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем права на редактирование (админ или автор)
            const isAdmin = userRole === 'admin';
            const isAuthor = (design.uploadedByClient?.id === userId) || 
                            (design.uploadedByAdmin?.id === userId);

            if (!isAdmin && !isAuthor) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недостаточно прав для редактирования дизайна'
                };
                res.status(403).json(response);
                return;
            }

            // Обновляем только разрешенные поля
            if (updateData.title) design.title = updateData.title;
            if (updateData.description) design.description = updateData.description;
            if (updateData.imageUrl) design.imageUrl = updateData.imageUrl;
            if (updateData.videoUrl !== undefined) design.videoUrl = updateData.videoUrl;
            if (updateData.tags) design.tags = updateData.tags;
            if (updateData.color) design.color = updateData.color;
            if (updateData.estimatedPrice !== undefined) design.estimatedPrice = updateData.estimatedPrice;
            
            // Только админ может менять тип и активность
            if (isAdmin) {
                if (updateData.type) design.type = updateData.type;
                if (updateData.isActive !== undefined) design.isActive = updateData.isActive;
            }

            await designRepository.save(design);

            const response: ApiResponse = {
                success: true,
                data: design,
                message: 'Дизайн успешно обновлен'
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
     * Удалить дизайн
     */
    static async deleteDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId!;
            const userRole = req.user!.role;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходима аутентификация'
                };
                res.status(401).json(response);
                return;
            }

            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const design = await designRepository.findOne({ 
                where: { id },
                relations: ['uploadedByClient', 'uploadedByAdmin']
            });

            if (!design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем права на удаление (админ или автор)
            const isAdmin = userRole === 'admin';
            const isAuthor = (design.uploadedByClient?.id === userId) || 
                            (design.uploadedByAdmin?.id === userId);

            if (!isAdmin && !isAuthor) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недостаточно прав для удаления дизайна'
                };
                res.status(403).json(response);
                return;
            }

            // Мягкое удаление (деактивация)
            design.isActive = false;
            await designRepository.save(design);

            const response: ApiResponse = {
                success: true,
                message: 'Дизайн успешно удален'
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
     * Получить популярные дизайны
     */
    static async getPopularDesigns(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 8;
            
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const designs = await designRepository.find({
                where: { isActive: true, isModerated: true },
                order: { likesCount: 'DESC' },
                take: Math.min(limit, 20), // Ограничиваем максимальное количество
                relations: ['uploadedByClient', 'uploadedByAdmin'] // Добавляем связи для получения информации о мастере
            });

            const response: ApiResponse<NailDesignEntity[]> = {
                success: true,
                data: designs
            };
            
            res.json(response);
        } catch (error) {
            console.error('Ошибка получения популярных дизайнов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить дизайны конкретного мастера
     */
    static async getMasterDesigns(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { masterId } = req.params;
            const currentUserId = req.userId;
            
            // Получаем дизайны автором которых является мастер (созданные мастером)
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const authoredDesigns = await designRepository.find({
                where: { 
                    uploadedByMaster: { id: masterId },
                    isActive: true
                },
                relations: ['uploadedByClient', 'uploadedByMaster'],
                order: { createdAt: 'DESC' }
            });

            // Получаем дизайны, которые мастер может выполнить (привязанные к услугам)
            const queryBuilder = AppDataSource
                .getRepository(MasterServiceDesignEntity)
                .createQueryBuilder('msd')
                .leftJoinAndSelect('msd.masterService', 'ms')
                .leftJoinAndSelect('msd.nailDesign', 'nd')
                .leftJoinAndSelect('ms.master', 'm')
                .leftJoinAndSelect('nd.uploadedByClient', 'uploadedByClient')
                .leftJoinAndSelect('nd.uploadedByMaster', 'uploadedByMaster')
                .where('m.id = :masterId', { masterId })
                .andWhere('msd.isActive = :isActive', { isActive: true })
                .andWhere('nd.isActive = :designActive', { designActive: true })
                // Исключаем дизайны, автором которых является сам мастер (они уже включены выше)
                .andWhere('(nd.uploadedByMaster IS NULL OR nd.uploadedByMaster != :masterId)', { masterId });

            // Логика для модерации привязанных дизайнов
            if (currentUserId === masterId) {
                // Мастер смотрит свои дизайны - показываем модерированные дизайны других авторов
                queryBuilder.andWhere('nd.isModerated = :isModerated', { isModerated: true });
            } else {
                // Кто-то другой смотрит дизайны мастера - только модерированные
                queryBuilder.andWhere('nd.isModerated = :isModerated', { isModerated: true });
            }

            const masterServiceDesigns = await queryBuilder.getMany();

            // Извлекаем уникальные дизайны из привязанных к услугам
            const serviceDesigns = [...new Map(
                masterServiceDesigns.map(msd => [msd.nailDesign.id, msd.nailDesign])
            ).values()];

            // Применяем логику модерации для авторских дизайнов
            let filteredAuthoredDesigns = authoredDesigns;
            if (currentUserId !== masterId) {
                // Если смотрит не сам мастер, показываем только модерированные авторские дизайны
                filteredAuthoredDesigns = authoredDesigns.filter(design => design.isModerated);
            }

            // Объединяем авторские дизайны и привязанные дизайны, убирая дубликаты
            const allDesigns = [...filteredAuthoredDesigns];
            serviceDesigns.forEach(design => {
                if (!allDesigns.some(d => d.id === design.id)) {
                    allDesigns.push(design);
                }
            });

            res.json({
                success: true,
                data: allDesigns,
                error: undefined
            } as ApiResponse);
        } catch (error) {
            console.error('Ошибка при получении дизайнов мастера:', error);
            res.status(500).json({
                success: false,
                data: null,
                error: 'Не удалось получить дизайны мастера'
            } as ApiResponse);
        }
    }

    /**
     * Получить понравившиеся дизайны пользователя
     */
    static async getUserLikedDesigns(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({
                where: { id: userId },
                relations: ['likedNailDesigns']
            });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Клиент не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Получаем активные и модерированные лайкнутые дизайны с пагинацией
            const likedDesigns = client.likedNailDesigns
                .filter(design => design.isActive && design.isModerated)
                .slice(skip, skip + limit);

            const total = client.likedNailDesigns.filter(design => design.isActive && design.isModerated).length;

            const response: PaginatedResponse<NailDesignEntity> = {
                success: true,
                data: likedDesigns,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения понравившихся дизайнов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Проверить статус лайка для дизайна
     */
    static async checkLikeStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId!;

            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({
                where: { id: userId },
                relations: ['likedNailDesigns']
            });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Клиент не найден'
                };
                res.status(404).json(response);
                return;
            }

            const isLiked = client.likedNailDesigns.some(design => design.id === id);

            const response: ApiResponse<{ isLiked: boolean }> = {
                success: true,
                data: { isLiked }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка проверки статуса лайка:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Загрузка изображения для дизайна
     */
    static async uploadDesignImage(req: any, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            
            console.log('[NailDesignController] uploadDesignImage запрос:');
            console.log('- userId:', userId);
            console.log('- req.file:', req.file);
            console.log('- req.body:', req.body);
            console.log('- Content-Type:', req.headers['content-type']);
            
            if (!req.file) {
                console.log('[NailDesignController] ❌ Файл не найден в запросе');
                const response: ApiResponse = {
                    success: false,
                    error: 'Файл изображения не предоставлен'
                };
                res.status(400).json(response);
                return;
            }

            console.log('[NailDesignController] uploadDesignImage для пользователя:', userId);
            console.log('[NailDesignController] файл:', req.file);

            // Проверяем тип файла
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем размер файла (максимум 10MB для дизайнов)
            const maxSize = 10 * 1024 * 1024;
            if (req.file.size > maxSize) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Файл слишком большой. Максимальный размер: 10MB'
                };
                res.status(400).json(response);
                return;
            }

            // Формируем путь для сохранения файла
            const fileExtension = req.file.mimetype.split('/')[1];
            const fileName = `design_${userId}_${Date.now()}.${fileExtension}`;
            const imageUrl = `/uploads/designs/${fileName}`;

            // Сохраняем файл
            const fs = require('fs');
            const path = require('path');
            
            // Создаем директорию если её нет
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'designs');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Сохраняем файл
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);

            console.log('[NailDesignController] ✅ Файл сохранен:', filePath);
            console.log('[NailDesignController] 🌐 URL изображения:', imageUrl);
            console.log('[NailDesignController] 📏 Размер файла:', req.file.buffer.length, 'байт');

            const response: ApiResponse<{ imageUrl: string }> = {
                success: true,
                data: {
                    imageUrl: imageUrl
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка загрузки изображения дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }
} 