import { Response } from 'express';
import { AppDataSource } from '../conf/orm.conf';
import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { NailDesignEntity } from '../entities/nail-design.entity';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { ClientEntity } from '../entities/client.entity';
import { MasterServiceEntity } from '../entities/master-service.entity';
import { MasterServiceDesignEntity } from '../entities/master-service-design.entity';
import { OrderDesignSnapshotEntity } from '../entities/order-design-snapshot.entity';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api.type';
import { Like, ILike } from 'typeorm';
import { DesignSnapshotUtil } from '../utils/design-snapshot.util';
import { OrderDesignUtil } from '../utils/order-design.util';

export class OrderController {
    /**
     * Создать новый заказ
     */
    static async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const {
                masterServiceId,
                nailDesignId,
                nailMasterId,
                requestedDateTime,
                description,
                clientNotes
            } = req.body;

            if (!masterServiceId || !nailMasterId || !requestedDateTime) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Услуга, мастер и время записи обязательны'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем существование услуги, дизайна (если указан) и мастера
            const serviceRepository = AppDataSource.getRepository(MasterServiceEntity);
            const designRepository = AppDataSource.getRepository(NailDesignEntity);
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const clientRepository = AppDataSource.getRepository(ClientEntity);

            const [service, design, master, client] = await Promise.all([
                serviceRepository.findOne({ 
                    where: { id: masterServiceId, isActive: true },
                    relations: ['master']
                }),
                nailDesignId ? designRepository.findOne({ where: { id: nailDesignId, isActive: true } }) : null,
                masterRepository.findOne({ where: { id: nailMasterId, isActive: true } }),
                clientRepository.findOne({ where: { id: userId } })
            ]);

            if (!service) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Услуга не найдена'
                };
                res.status(404).json(response);
                return;
            }

            if (service.master.id !== nailMasterId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Услуга не принадлежит указанному мастеру'
                };
                res.status(400).json(response);
                return;
            }

            if (nailDesignId && !design) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Дизайн не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Клиент не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Создаем заказ
            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const snapshotRepository = AppDataSource.getRepository(OrderDesignSnapshotEntity);
            const masterServiceDesignRepository = AppDataSource.getRepository(MasterServiceDesignEntity);
            const order = new OrderEntity();
            
            order.description = description;
            order.requestedDateTime = new Date(requestedDateTime);
            order.clientNotes = clientNotes;
            order.status = OrderStatus.PENDING;
            order.client = client;
            order.nailMaster = master;
            order.masterService = service;

            // Рассчитываем общую стоимость заказа
            let totalPrice = Number(service.price) || 0; // Базовая цена услуги (преобразуем в число)

            // Если указан дизайн, добавляем его стоимость
            if (design) {
                // Ищем связь между услугой и дизайном для получения customPrice
                const serviceDesign = await masterServiceDesignRepository.findOne({
                    where: {
                        masterService: { id: masterServiceId },
                        nailDesign: { id: nailDesignId },
                        isActive: true
                    }
                });

                if (serviceDesign && serviceDesign.customPrice) {
                    totalPrice += Number(serviceDesign.customPrice) || 0; // Добавляем стоимость дизайна (преобразуем в число)
                }

                // Устанавливаем связь с дизайном
                order.nailDesign = design;
                
                // Создаем снимок дизайна
                const snapshot = DesignSnapshotUtil.createDesignSnapshot(design);
                const savedSnapshot = await snapshotRepository.save(snapshot);
                order.designSnapshot = savedSnapshot;
                
                // Увеличиваем счетчик заказов у дизайна
                design.ordersCount += 1;
                await designRepository.save(design);
            }

            order.price = totalPrice; // Устанавливаем итоговую стоимость

            const savedOrder = await orderRepository.save(order);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: savedOrder,
                message: 'Заказ создан и отправлен мастеру'
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получить заказы пользователя
     */
    static async getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const userRole = req.user!.role;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as OrderStatus;
            
            const skip = (page - 1) * limit;
            
            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const queryBuilder = orderRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.client', 'client')
                .leftJoinAndSelect('order.nailMaster', 'master')
                .leftJoinAndSelect('order.nailDesign', 'design')
                .leftJoinAndSelect('order.designSnapshot', 'designSnapshot')
                .leftJoinAndSelect('order.masterService', 'service');

            // Фильтруем по роли пользователя
            if (userRole === 'client') {
                queryBuilder.where('order.clientId = :userId', { userId });
            } else if (userRole === 'nailmaster') {
                queryBuilder.where('order.nailMasterId = :userId', { userId });
            }

            // Фильтр по статусу
            if (status) {
                queryBuilder.andWhere('order.status = :status', { status });
            }

            const [orders, total] = await queryBuilder
                .orderBy('order.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            const response: PaginatedResponse<OrderEntity> = {
                success: true,
                data: orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения заказов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Подтвердить заказ (для мастера)
     */
    static async confirmOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId!;
            const { price, masterNotes } = req.body;

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const order = await orderRepository.findOne({
                where: { id: orderId },
                relations: ['client', 'nailMaster']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (order.nailMaster.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Нет прав для изменения этого заказа'
                };
                res.status(403).json(response);
                return;
            }

            if (order.status !== OrderStatus.PENDING) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ уже был обработан'
                };
                res.status(400).json(response);
                return;
            }

            // Подтверждаем заказ
            order.status = OrderStatus.CONFIRMED;
            order.confirmedDateTime = order.requestedDateTime;
            order.masterResponseTime = new Date();
            if (price) order.price = Number(price) || 0;
            if (masterNotes) order.masterNotes = masterNotes;

            const updatedOrder = await orderRepository.save(order);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: updatedOrder,
                message: 'Заказ подтвержден'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка подтверждения заказа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Предложить альтернативное время (для мастера)
     */
    static async proposeAlternativeTime(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId!;
            const { proposedDateTime, masterNotes } = req.body;

            if (!proposedDateTime) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Предложенное время обязательно'
                };
                res.status(400).json(response);
                return;
            }

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const order = await orderRepository.findOne({
                where: { id: orderId },
                relations: ['client', 'nailMaster']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (order.nailMaster.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Нет прав для изменения этого заказа'
                };
                res.status(403).json(response);
                return;
            }

            if (order.status !== OrderStatus.PENDING) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ уже был обработан'
                };
                res.status(400).json(response);
                return;
            }

            // Предлагаем альтернативное время
            order.status = OrderStatus.ALTERNATIVE_PROPOSED;
            order.proposedDateTime = new Date(proposedDateTime);
            order.masterResponseTime = new Date();
            if (masterNotes) order.masterNotes = masterNotes;

            const updatedOrder = await orderRepository.save(order);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: updatedOrder,
                message: 'Альтернативное время предложено'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка предложения времени:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Отклонить заказ (для мастера)
     */
    static async declineOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId!;
            const { masterNotes } = req.body;

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const order = await orderRepository.findOne({
                where: { id: orderId },
                relations: ['client', 'nailMaster']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (order.nailMaster.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Нет прав для изменения этого заказа'
                };
                res.status(403).json(response);
                return;
            }

            if (order.status !== OrderStatus.PENDING) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ уже был обработан'
                };
                res.status(400).json(response);
                return;
            }

            // Отклоняем заказ
            order.status = OrderStatus.DECLINED;
            order.masterResponseTime = new Date();
            if (masterNotes) order.masterNotes = masterNotes;

            const updatedOrder = await orderRepository.save(order);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: updatedOrder,
                message: 'Заказ отклонен'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка отклонения заказа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Принять предложенное время (для клиента)
     */
    static async acceptProposedTime(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId!;

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const order = await orderRepository.findOne({
                where: { id: orderId },
                relations: ['client', 'nailMaster']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (order.client.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Нет прав для изменения этого заказа'
                };
                res.status(403).json(response);
                return;
            }

            if (order.status !== OrderStatus.ALTERNATIVE_PROPOSED) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Альтернативное время не было предложено'
                };
                res.status(400).json(response);
                return;
            }

            // Принимаем предложенное время
            order.status = OrderStatus.CONFIRMED;
            order.confirmedDateTime = order.proposedDateTime;

            const updatedOrder = await orderRepository.save(order);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: updatedOrder,
                message: 'Предложенное время принято'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка принятия времени:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Отменить заказ (для клиента)
     */
    static async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId!;

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const order = await orderRepository.findOne({
                where: { id: orderId },
                relations: ['client', 'nailMaster']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            if (order.client.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Нет прав для отмены этого заказа'
                };
                res.status(403).json(response);
                return;
            }

            // Проверяем, можно ли отменить заказ
            if (![OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.ALTERNATIVE_PROPOSED].includes(order.status)) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ нельзя отменить в текущем статусе'
                };
                res.status(400).json(response);
                return;
            }

            // Отменяем заказ
            order.status = OrderStatus.CANCELLED;

            const updatedOrder = await orderRepository.save(order);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: updatedOrder,
                message: 'Заказ отменен'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка отмены заказа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Поиск заказов по ID или данным клиента/мастера
     */
    static async searchOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { query, limit = 10 } = req.query;
            const userId = req.userId;
            const role = req.user?.role;
            
            if (!userId || !role) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Не удалось определить пользователя'
                };
                res.status(401).json(response);
                return;
            }

            if (!query || typeof query !== 'string') {
                const response: ApiResponse = {
                    success: false,
                    error: 'Необходимо указать поисковый запрос'
                };
                res.status(400).json(response);
                return;
            }

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            
            // Базовые условия поиска
            let whereConditions: any[] = [
                { id: Like(`%${query}%`) }
            ];
            
            // Ограничиваем поиск в зависимости от роли
            if (role === 'client') {
                whereConditions = whereConditions.map(condition => ({
                    ...condition,
                    clientId: userId
                }));
            } else if (role === 'nailmaster') {
                whereConditions = whereConditions.map(condition => ({
                    ...condition,
                    masterId: userId
                }));
            } else if (role === 'admin') {
                // Админ может искать по всем заказам
            } else {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недостаточно прав для поиска заказов'
                };
                res.status(403).json(response);
                return;
            }

            const orders = await orderRepository.find({
                where: whereConditions,
                take: Math.min(parseInt(limit as string) || 10, 50),
                order: {
                    createdAt: 'DESC'
                },
                relations: ['nailDesign', 'nailMaster', 'client', 'masterService']
            });

            const response: ApiResponse = {
                success: true,
                data: { orders }
            };
            res.json(response);
        } catch (error) {
            console.error('Ошибка при поиске заказов:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Ошибка при поиске заказов'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получение информации о конкретном заказе
     */
    static async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId;
            const role = req.user?.role;
            
            if (!userId || !role) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Не удалось определить пользователя'
                };
                res.status(401).json(response);
                return;
            }

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            
            // Базовые условия поиска
            const whereCondition: any = { id: orderId };
            
            // Ограничиваем доступ в зависимости от роли
            if (role === 'client') {
                whereCondition.clientId = userId;
            } else if (role === 'nailmaster') {
                whereCondition.masterId = userId;
            } else if (role === 'admin') {
                // Админ может получить любой заказ
            } else {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недостаточно прав для просмотра заказа'
                };
                res.status(403).json(response);
                return;
            }

            const order = await orderRepository.findOne({
                where: whereCondition,
                relations: ['nailDesign', 'designSnapshot', 'nailMaster', 'client', 'masterService']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Получаем информацию о дизайне
            const designInfo = OrderDesignUtil.getDesignInfo(order);

            const response: ApiResponse = {
                success: true,
                data: {
                    ...order,
                    designInfo
                }
            };
            res.json(response);
        } catch (error) {
            console.error('Ошибка при получении заказа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Ошибка при получении заказа'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Завершить заказ (для мастера)
     * Мастер может завершить заказ только после наступления даты и времени заказа
     */
    static async completeOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.userId!;
            const { masterNotes, rating } = req.body;

            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const order = await orderRepository.findOne({
                where: { id: orderId },
                relations: ['client', 'nailMaster', 'masterService']
            });

            if (!order) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем, что заказ принадлежит этому мастеру
            if (order.nailMaster.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Нет прав для завершения этого заказа'
                };
                res.status(403).json(response);
                return;
            }

            // Проверяем, что заказ подтвержден
            if (order.status !== OrderStatus.CONFIRMED) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Можно завершить только подтвержденные заказы'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем, что время заказа уже наступило
            const now = new Date();
            const appointmentTime = order.confirmedDateTime || order.requestedDateTime;
            
            if (appointmentTime > now) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Заказ можно завершить только после наступления времени записи'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем, что прошло не более 24 часов с момента записи (опционально)
            const maxCompletionTime = new Date(appointmentTime.getTime() + 24 * 60 * 60 * 1000); // +24 часа
            if (now > maxCompletionTime) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Время для завершения заказа истекло (максимум 24 часа после записи)'
                };
                res.status(400).json(response);
                return;
            }

            // Завершаем заказ
            order.status = OrderStatus.COMPLETED;
            order.completedAt = now;
            order.completedBy = 'master';
            if (masterNotes) order.masterNotes = masterNotes;
            if (rating) order.rating = rating;

            const updatedOrder = await orderRepository.save(order);

            // Увеличиваем счетчик выполненных заказов у мастера
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            await masterRepository.increment({ id: userId }, 'totalOrders', 1);

            const response: ApiResponse<OrderEntity> = {
                success: true,
                data: updatedOrder,
                message: 'Заказ успешно завершен'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка завершения заказа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }
} 