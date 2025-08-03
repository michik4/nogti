import { Request, Response } from 'express';
import { AppDataSource } from '../conf/orm.conf';
import { 
  UserEntity, 
  NailDesignEntity, 
  OrderEntity, 
  NailMasterEntity,
  Role,
  OrderStatus,
  DesignSource
} from '../entities';
import { Like } from 'typeorm';

export class AdminController {
  /**
   * Получение общей статистики для админ панели
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Получаем репозитории
      const userRepo = AppDataSource.getRepository(UserEntity);
      const orderRepo = AppDataSource.getRepository(OrderEntity);
      const designRepo = AppDataSource.getRepository(NailDesignEntity);
      const masterRepo = AppDataSource.getRepository(NailMasterEntity);

      // Собираем статистику
      const [
        totalUsers,
        totalMasters,
        totalClients,
        totalBookings,
        activeBookings,
        totalDesigns,
        totalUploads,
        revenue
      ] = await Promise.all([
        // Общее количество пользователей
        userRepo.count(),
        // Количество мастеров
        userRepo.count({ where: { role: Role.NAILMASTER } }),
        // Количество клиентов
        userRepo.count({ where: { role: Role.CLIENT } }),
        // Общее количество заказов
        orderRepo.count(),
        // Активные заказы (в статусе pending или confirmed)
        orderRepo.count({
          where: [
            { status: OrderStatus.PENDING },
            { status: OrderStatus.CONFIRMED }
          ]
        }),
        // Общее количество дизайнов
        designRepo.count(),
        // Количество загрузок (дизайны от мастеров)
        designRepo.count({ where: { source: DesignSource.MASTER } }),
        // Общая выручка (сумма всех подтвержденных заказов)
        orderRepo
          .createQueryBuilder('order')
          .where('order.status = :status', { status: OrderStatus.COMPLETED })
          .select('SUM(order.price)', 'total')
          .getRawOne()
          .then(result => result?.total || 0)
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalMasters,
          totalClients,
          totalBookings,
          activeBookings,
          totalDesigns,
          totalUploads,
          revenue
        }
      });
    } catch (error) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить статистику'
      });
    }
  }

  /**
   * Получение списка пользователей с пагинацией и поиском
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const userRepo = AppDataSource.getRepository(UserEntity);
      
      // Формируем условия поиска
      const whereConditions: any = {};
      if (search) {
        whereConditions.where = [
          { email: Like(`%${search}%`) },
          { username: Like(`%${search}%`) }
        ];
      }

      // Получаем пользователей с пагинацией
      const [users, total] = await userRepo.findAndCount({
        ...whereConditions,
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      });

      // Преобразуем данные для ответа
      const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isGuest: user.isGuest,
        avatar_url: user.avatar_url,
        createdAt: user.createdAt
      }));

      res.json({
        success: true,
        data: {
          users: formattedUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting users list:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить список пользователей'
      });
    }
  }

  /**
   * Получение списка дизайнов с пагинацией
   */
  static async getDesigns(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const source = req.query.source as string;
      const isModerated = req.query.isModerated !== undefined ? req.query.isModerated === 'true' : undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const search = (req.query.search as string || '').toLowerCase();

      const designRepo = AppDataSource.getRepository(NailDesignEntity);
      
      // Создаем QueryBuilder
      const queryBuilder = designRepo.createQueryBuilder('nail_designs')
        .leftJoinAndSelect('nail_designs.uploadedByClient', 'uploadedByClient')
        .leftJoinAndSelect('nail_designs.uploadedByAdmin', 'uploadedByAdmin')
        .leftJoinAndSelect('nail_designs.uploadedByMaster', 'uploadedByMaster');

      // Добавляем условия фильтрации
      if (type) {
        queryBuilder.andWhere('nail_designs.type = :type', { type });
      }
      if (source) {
        queryBuilder.andWhere('nail_designs.source = :source', { source });
      }
      if (isModerated !== undefined) {
        queryBuilder.andWhere('nail_designs.isModerated = :isModerated', { isModerated });
      }
      if (isActive !== undefined) {
        queryBuilder.andWhere('nail_designs.isActive = :isActive', { isActive });
      }
      if (search) {
        queryBuilder.andWhere('LOWER(nail_designs.title) LIKE :search', { search: `%${search}%` });
      }

      // Добавляем пагинацию и сортировку
      queryBuilder
        .orderBy('nail_designs.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // Получаем результаты
      const [designs, total] = await queryBuilder.getManyAndCount();

      // Преобразуем данные для ответа
      const formattedDesigns = designs.map(design => ({
        id: design.id,
        title: design.title,
        description: design.description,
        type: design.type,
        source: design.source,
        imageUrl: design.imageUrl,
        authorName: design.uploadedByClient?.username || design.uploadedByAdmin?.username || design.uploadedByMaster?.username || 'Система',
        likesCount: design.likesCount,
        isModerated: design.isModerated,
        isActive: design.isActive,
        createdAt: design.createdAt
      }));

      res.json({
        success: true,
        data: {
          designs: formattedDesigns,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting designs list:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить список дизайнов'
      });
    }
  }

  /**
   * Получение списка заказов с пагинацией
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as OrderStatus | undefined;

      const orderRepo = AppDataSource.getRepository(OrderEntity);
      
      // Формируем условия поиска
      const whereConditions: any = {};
      if (status) {
        whereConditions.where = { status };
      }

      // Получаем заказы с пагинацией
      const [orders, total] = await orderRepo.findAndCount({
        relations: ['client', 'nailMaster', 'nailDesign'],
        ...whereConditions,
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      });

      // Преобразуем данные для ответа
      const formattedOrders = orders.map(order => ({
        id: order.id,
        clientName: order.client?.username || 'Удалён',
        masterName: order.nailMaster?.username || 'Удалён',
        designTitle: order.nailDesign?.title || 'Удалён',
        status: order.status,
        price: order.price,
        requestedDateTime: order.requestedDateTime,
        createdAt: order.createdAt
      }));

      res.json({
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting orders list:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить список заказов'
      });
    }
  }

  /**
   * Блокировка/разблокировка пользователя
   */
  static async toggleUserBlock(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { blocked } = req.body;

      const userRepo = AppDataSource.getRepository(UserEntity);
      
      // Находим пользователя
      const user = await userRepo.findOne({ where: { id: userId } });
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
        return;
      }

      // Обновляем статус блокировки
      user.blocked = blocked;
      await userRepo.save(user);

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          blocked: user.blocked,
          isGuest: user.isGuest,
          avatar_url: user.avatar_url,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Error toggling user block status:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось изменить статус блокировки пользователя'
      });
    }
  }

  /**
   * Модерация дизайна (одобрение/отклонение)
   */
  static async moderateDesign(req: Request, res: Response): Promise<void> {
    try {
      const designId = req.params.designId;
      const { approved } = req.body;

      const designRepo = AppDataSource.getRepository(NailDesignEntity);
      
      // Находим дизайн
      const design = await designRepo.findOne({ where: { id: designId } });
      
      if (!design) {
        res.status(404).json({
          success: false,
          error: 'Дизайн не найден'
        });
        return;
      }

      // Обновляем статус модерации
      design.isModerated = true;
      design.isActive = approved;
      
      await designRepo.save(design);

      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      console.error('Error moderating design:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось изменить статус дизайна'
      });
    }
  }
} 