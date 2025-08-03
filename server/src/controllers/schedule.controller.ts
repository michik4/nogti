import { Response, Request } from 'express';
import { AppDataSource } from '../conf/orm.conf';
import { ScheduleEntity, ScheduleStatus } from '../entities/schedule.entity';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { MasterServiceEntity } from '../entities/master-service.entity';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api.type';
import { ResponseUtil } from '../utils/response.util';
import { validate as uuidValidate } from 'uuid';
import { MoreThanOrEqual, LessThan } from 'typeorm';

export class ScheduleController {
    /**
     * Получить расписание мастера с учетом занятых окон
     */
    static async getMasterSchedule(req: Request, res: Response): Promise<void> {
        try {
            const { masterId } = req.params;
            const { startDate, endDate } = req.query;

            if (!uuidValidate(masterId)) {
                ResponseUtil.error(res, 'Невалидный ID мастера', 400);
                return;
            }

            // Проверяем существование мастера
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: masterId } });

            if (!master) {
                ResponseUtil.error(res, 'Мастер не найден', 404);
                return;
            }

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const queryBuilder = scheduleRepository
                .createQueryBuilder('schedule')
                .where('schedule.nailMaster.id = :masterId', { masterId });

            if (startDate) {
                queryBuilder.andWhere('schedule.workDate >= :startDate', { startDate });
            }

            if (endDate) {
                queryBuilder.andWhere('schedule.workDate <= :endDate', { endDate });
            }

            const schedules = await queryBuilder
                .orderBy('schedule.workDate', 'ASC')
                .addOrderBy('schedule.startTime', 'ASC')
                .getMany();

            // Получаем заказы для определения занятых окон
            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const orders = await orderRepository.find({
                where: [
                    { nailMaster: { id: masterId }, status: OrderStatus.CONFIRMED },
                    { nailMaster: { id: masterId }, status: OrderStatus.COMPLETED }
                ],
                relations: ['masterService']
            });

            // Создаем карту занятых окон
            const occupiedSlots = new Map<string, Set<string>>();
            
            orders.forEach(order => {
                if (order.confirmedDateTime) {
                    const orderDate = order.confirmedDateTime.toISOString().split('T')[0];
                    const orderTime = order.confirmedDateTime.toTimeString().substring(0, 5);
                    
                    if (!occupiedSlots.has(orderDate)) {
                        occupiedSlots.set(orderDate, new Set());
                    }
                    
                    const timeSlots = occupiedSlots.get(orderDate)!;
                    
                    // Добавляем основное время заказа
                    timeSlots.add(orderTime);
                    
                    // Если длительность услуги больше 60 минут, занимаем соседние часы
                    if (order.masterService && order.masterService.duration > 60) {
                        const startHour = parseInt(orderTime.split(':')[0]);
                        const startMinute = parseInt(orderTime.split(':')[1]);
                        
                        // Вычисляем количество часов, которые нужно заблокировать
                        const totalHours = Math.ceil(order.masterService.duration / 60);
                        
                        for (let hour = 1; hour < totalHours; hour++) {
                            const nextHour = (startHour + hour) % 24;
                            const nextTime = `${nextHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                            timeSlots.add(nextTime);
                        }
                    }
                }
            });

            // Фильтруем расписание, исключая занятые окна
            const filteredSchedules = schedules.filter(schedule => {
                const dateStr = typeof schedule.workDate === 'string' 
                    ? schedule.workDate 
                    : schedule.workDate.toISOString().split('T')[0];
                
                const occupiedTimes = occupiedSlots.get(dateStr);
                if (!occupiedTimes) return true; // Нет занятых окон на эту дату
                
                // Проверяем, не пересекается ли окно с занятым временем
                const slotStart = schedule.startTime;
                const slotEnd = schedule.endTime;
                
                for (const occupiedTime of occupiedTimes) {
                    // Если окно начинается в занятое время или пересекается с ним
                    if (slotStart <= occupiedTime && slotEnd > occupiedTime) {
                        return false; // Исключаем это окно
                    }
                }
                
                return true;
            });

            // Группируем по датам
            const scheduleByDate: { [date: string]: ScheduleEntity[] } = {};
            filteredSchedules.forEach(schedule => {
                const dateStr = typeof schedule.workDate === 'string' 
                    ? schedule.workDate 
                    : schedule.workDate.toISOString().split('T')[0];
                if (!scheduleByDate[dateStr]) {
                    scheduleByDate[dateStr] = [];
                }
                scheduleByDate[dateStr].push(schedule);
            });

            const result = Object.entries(scheduleByDate).map(([date, timeSlots]) => ({
                date,
                timeSlots
            }));

            ResponseUtil.success(res, 'Расписание получено', result);
        } catch (error) {
            console.error('Ошибка получения расписания:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Получить расписание текущего мастера с учетом занятых окон
     */
    static async getMySchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { startDate, endDate } = req.query;

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const queryBuilder = scheduleRepository
                .createQueryBuilder('schedule')
                .where('schedule.nailMaster.id = :masterId', { masterId: userId });

            if (startDate) {
                queryBuilder.andWhere('schedule.workDate >= :startDate', { startDate });
            }

            if (endDate) {
                queryBuilder.andWhere('schedule.workDate <= :endDate', { endDate });
            }

            const schedules = await queryBuilder
                .orderBy('schedule.workDate', 'ASC')
                .addOrderBy('schedule.startTime', 'ASC')
                .getMany();

            // Получаем заказы для определения занятых окон
            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const orders = await orderRepository.find({
                where: [
                    { nailMaster: { id: userId }, status: OrderStatus.CONFIRMED },
                    { nailMaster: { id: userId }, status: OrderStatus.COMPLETED }
                ],
                relations: ['masterService']
            });

            // Создаем карту занятых окон
            const occupiedSlots = new Map<string, Set<string>>();
            
            orders.forEach(order => {
                if (order.confirmedDateTime) {
                    const orderDate = order.confirmedDateTime.toISOString().split('T')[0];
                    const orderTime = order.confirmedDateTime.toTimeString().substring(0, 5);
                    
                    if (!occupiedSlots.has(orderDate)) {
                        occupiedSlots.set(orderDate, new Set());
                    }
                    
                    const timeSlots = occupiedSlots.get(orderDate)!;
                    
                    // Добавляем основное время заказа
                    timeSlots.add(orderTime);
                    
                    // Если длительность услуги больше 60 минут, занимаем соседние часы
                    if (order.masterService && order.masterService.duration > 60) {
                        const startHour = parseInt(orderTime.split(':')[0]);
                        const startMinute = parseInt(orderTime.split(':')[1]);
                        
                        // Вычисляем количество часов, которые нужно заблокировать
                        const totalHours = Math.ceil(order.masterService.duration / 60);
                        
                        for (let hour = 1; hour < totalHours; hour++) {
                            const nextHour = (startHour + hour) % 24;
                            const nextTime = `${nextHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                            timeSlots.add(nextTime);
                        }
                    }
                }
            });

            // Фильтруем расписание, исключая занятые окна
            const filteredSchedules = schedules.filter(schedule => {
                const dateStr = typeof schedule.workDate === 'string' 
                    ? schedule.workDate 
                    : schedule.workDate.toISOString().split('T')[0];
                
                const occupiedTimes = occupiedSlots.get(dateStr);
                if (!occupiedTimes) return true; // Нет занятых окон на эту дату
                
                // Проверяем, не пересекается ли окно с занятым временем
                const slotStart = schedule.startTime;
                const slotEnd = schedule.endTime;
                
                for (const occupiedTime of occupiedTimes) {
                    // Если окно начинается в занятое время или пересекается с ним
                    if (slotStart <= occupiedTime && slotEnd > occupiedTime) {
                        return false; // Исключаем это окно
                    }
                }
                
                return true;
            });

            // Группируем по датам
            const scheduleByDate: { [date: string]: ScheduleEntity[] } = {};
            filteredSchedules.forEach(schedule => {
                const dateStr = typeof schedule.workDate === 'string' 
                    ? schedule.workDate 
                    : schedule.workDate.toISOString().split('T')[0];
                if (!scheduleByDate[dateStr]) {
                    scheduleByDate[dateStr] = [];
                }
                scheduleByDate[dateStr].push(schedule);
            });

            const result = Object.entries(scheduleByDate).map(([date, timeSlots]) => ({
                date,
                timeSlots
            }));

            ResponseUtil.success(res, 'Расписание получено', result);
        } catch (error) {
            console.error('Ошибка получения расписания:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Добавить временное окно
     */
    static async addTimeSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { workDate, startTime, endTime, status = 'available', notes } = req.body;

            console.log(`=== ЗАПРОС НА ДОБАВЛЕНИЕ ВРЕМЕННОГО ОКНА ===`);
            console.log(`User ID: ${userId}`);
            console.log(`Данные запроса:`, { workDate, startTime, endTime, status, notes });

            // Валидация данных
            if (!workDate || !startTime || !endTime) {
                console.log(`❌ ОШИБКА ВАЛИДАЦИИ: отсутствуют обязательные поля`);
                ResponseUtil.error(res, 'Необходимо указать дату, время начала и окончания', 400);
                return;
            }

            // Проверяем, что пользователь - мастер
            console.log(`Проверка мастера для ID: ${userId}`);
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: userId } });

            if (!master) {
                console.log(`❌ ОШИБКА: мастер не найден`);
                ResponseUtil.error(res, 'Мастер не найден', 404);
                return;
            }
            console.log(`✅ Мастер найден: ${master.fullName || master.username}`);

            // Проверяем, что время окончания больше времени начала
            console.log(`Проверка времени: ${startTime} >= ${endTime} = ${startTime >= endTime}`);
            if (startTime >= endTime) {
                console.log(`❌ ОШИБКА: время окончания не больше времени начала`);
                ResponseUtil.error(res, 'Время окончания должно быть больше времени начала', 400);
                return;
            }
            console.log(`✅ Время корректное`);

            // Проверяем, что дата не в прошлом
            const workDateObj = new Date(workDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            console.log(`Проверка даты: ${workDateObj} < ${today} = ${workDateObj < today}`);
            if (workDateObj < today) {
                console.log(`❌ ОШИБКА: дата в прошлом`);
                ResponseUtil.error(res, 'Нельзя создавать временные окна в прошлом', 400);
                return;
            }
            console.log(`✅ Дата корректная`);

            // Проверяем, нет ли пересечений с существующими окнами
            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const conflictingSlots = await scheduleRepository.find({
                where: {
                    nailMaster: { id: userId },
                    workDate: workDateObj
                }
            });

            console.log(`=== ДЕТАЛЬНАЯ ПРОВЕРКА ПЕРЕСЕЧЕНИЙ ===`);
            console.log(`Дата: ${workDate}`);
            console.log(`Новое окно: ${startTime}-${endTime}`);
            console.log(`Мастер ID: ${userId}`);
            console.log(`Найдено существующих окон: ${conflictingSlots.length}`);
            
            if (conflictingSlots.length > 0) {
                console.log('Существующие окна:');
                conflictingSlots.forEach((slot, index) => {
                    console.log(`  ${index + 1}. ${slot.startTime}-${slot.endTime} (статус: ${slot.status})`);
                });
            }

            for (const slot of conflictingSlots) {
                // Проверяем точное совпадение временных окон
                const newStart = startTime;
                const newEnd = endTime;
                const existingStart = slot.startTime;
                const existingEnd = slot.endTime;
                
                console.log(`\n--- Сравнение ---`);
                console.log(`Новое окно: ${newStart}-${newEnd}`);
                console.log(`Существующее окно: ${existingStart}-${existingEnd} (статус: ${slot.status})`);
                console.log(`Проверка точного совпадения: ${newStart === existingStart && newEnd === existingEnd}`);
                
                // Проверяем точное совпадение
                if (newStart === existingStart && newEnd === existingEnd) {
                    console.log(`❌ НАЙДЕНО ТОЧНОЕ СОВПАДЕНИЕ!`);
                    console.log(`Новое: ${newStart}-${newEnd}`);
                    console.log(`Существующее: ${existingStart}-${existingEnd}`);
                    ResponseUtil.error(res, `Временное окно с таким же временем уже существует (${existingStart}-${existingEnd})`, 409);
                    return;
                }
                
                console.log(`✅ Точного совпадения нет - продолжаем`);
                
                // Для фиксированных часовых окон проверяем только точное совпадение
                // Не проверяем пересечения, так как окна должны быть независимыми
                // Например: 09:00-10:00 и 10:00-11:00 не должны конфликтовать
            }
            
            console.log(`✅ Все проверки пройдены - создаем новое окно`);

            // Создаем новое временное окно
            const newSlot = new ScheduleEntity();
            newSlot.nailMaster = master;
            newSlot.workDate = workDateObj;
            newSlot.startTime = startTime;
            newSlot.endTime = endTime;
            newSlot.status = status as ScheduleStatus;
            newSlot.notes = notes;

            const savedSlot = await scheduleRepository.save(newSlot);
            console.log(`🎉 Временное окно успешно добавлено!`);
            console.log(`ID: ${savedSlot.id}`);
            console.log(`Время: ${savedSlot.startTime}-${savedSlot.endTime}`);
            console.log(`Дата: ${savedSlot.workDate}`);
            console.log(`Статус: ${savedSlot.status}`);
            ResponseUtil.success(res, 'Временное окно добавлено', savedSlot);
        } catch (error) {
            console.error('❌ ОШИБКА добавления временного окна:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Обновить временное окно
     */
    static async updateTimeSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { slotId } = req.params;
            const { startTime, endTime, status, notes } = req.body;

            if (!uuidValidate(slotId)) {
                ResponseUtil.error(res, 'Невалидный ID временного окна', 400);
                return;
            }

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const slot = await scheduleRepository.findOne({
                where: { 
                    id: slotId,
                    nailMaster: { id: userId }
                }
            });

            if (!slot) {
                ResponseUtil.error(res, 'Временное окно не найдено', 404);
                return;
            }

            // Обновляем только переданные поля
            if (startTime !== undefined) slot.startTime = startTime;
            if (endTime !== undefined) slot.endTime = endTime;
            if (status !== undefined) slot.status = status as ScheduleStatus;
            if (notes !== undefined) slot.notes = notes;

            // Проверяем, что время окончания больше времени начала
            if (slot.startTime >= slot.endTime) {
                ResponseUtil.error(res, 'Время окончания должно быть больше времени начала', 400);
                return;
            }

            const updatedSlot = await scheduleRepository.save(slot);
            ResponseUtil.success(res, 'Временное окно обновлено', updatedSlot);
        } catch (error) {
            console.error('Ошибка обновления временного окна:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Удалить временное окно
     */
    static async deleteTimeSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { slotId } = req.params;

            if (!uuidValidate(slotId)) {
                ResponseUtil.error(res, 'Невалидный ID временного окна', 400);
                return;
            }

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const slot = await scheduleRepository.findOne({
                where: { 
                    id: slotId,
                    nailMaster: { id: userId }
                }
            });

            if (!slot) {
                ResponseUtil.error(res, 'Временное окно не найдено', 404);
                return;
            }

            // Проверяем, что окно не забронировано
            if (slot.status === ScheduleStatus.BOOKED) {
                ResponseUtil.error(res, 'Нельзя удалить забронированное временное окно', 400);
                return;
            }

            await scheduleRepository.remove(slot);
            ResponseUtil.success(res, 'Временное окно удалено');
        } catch (error) {
            console.error('Ошибка удаления временного окна:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Получить доступные временные окна для бронирования с учетом занятых окон
     */
    static async getAvailableSlots(req: Request, res: Response): Promise<void> {
        try {
            const { masterId } = req.params;
            const { date } = req.query;

            if (!uuidValidate(masterId)) {
                ResponseUtil.error(res, 'Невалидный ID мастера', 400);
                return;
            }

            if (!date || typeof date !== 'string') {
                ResponseUtil.error(res, 'Необходимо указать дату', 400);
                return;
            }

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const allSlots = await scheduleRepository.find({
                where: {
                    nailMaster: { id: masterId },
                    workDate: new Date(date),
                    status: ScheduleStatus.AVAILABLE
                },
                order: {
                    startTime: 'ASC'
                }
            });

            // Получаем заказы для определения занятых окон
            const orderRepository = AppDataSource.getRepository(OrderEntity);
            const orders = await orderRepository.find({
                where: [
                    { 
                        nailMaster: { id: masterId }, 
                        status: OrderStatus.CONFIRMED,
                        confirmedDateTime: MoreThanOrEqual(new Date(date))
                    },
                    { 
                        nailMaster: { id: masterId }, 
                        status: OrderStatus.COMPLETED,
                        confirmedDateTime: MoreThanOrEqual(new Date(date))
                    }
                ],
                relations: ['masterService']
            });

            // Создаем карту занятых окон
            const occupiedSlots = new Set<string>();
            
            orders.forEach(order => {
                if (order.confirmedDateTime) {
                    const orderTime = order.confirmedDateTime.toTimeString().substring(0, 5);
                    
                    // Добавляем основное время заказа
                    occupiedSlots.add(orderTime);
                    
                    // Если длительность услуги больше 60 минут, занимаем соседние часы
                    if (order.masterService && order.masterService.duration > 60) {
                        const startHour = parseInt(orderTime.split(':')[0]);
                        const startMinute = parseInt(orderTime.split(':')[1]);
                        
                        // Вычисляем количество часов, которые нужно заблокировать
                        const totalHours = Math.ceil(order.masterService.duration / 60);
                        
                        for (let hour = 1; hour < totalHours; hour++) {
                            const nextHour = (startHour + hour) % 24;
                            const nextTime = `${nextHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                            occupiedSlots.add(nextTime);
                        }
                    }
                }
            });

            // Фильтруем слоты, исключая занятые окна
            const availableSlots = allSlots.filter(slot => {
                const slotStart = slot.startTime;
                const slotEnd = slot.endTime;
                
                for (const occupiedTime of occupiedSlots) {
                    // Если окно начинается в занятое время или пересекается с ним
                    if (slotStart <= occupiedTime && slotEnd > occupiedTime) {
                        return false; // Исключаем это окно
                    }
                }
                
                return true;
            });

            ResponseUtil.success(res, 'Доступные временные окна получены', availableSlots);
        } catch (error) {
            console.error('Ошибка получения доступных окон:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Заблокировать временное окно (для бронирования)
     */
    static async blockTimeSlot(req: Request, res: Response): Promise<void> {
        try {
            const { masterId, slotId } = req.params;
            const { orderId } = req.body;

            if (!uuidValidate(masterId) || !uuidValidate(slotId)) {
                ResponseUtil.error(res, 'Невалидные ID', 400);
                return;
            }

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const slot = await scheduleRepository.findOne({
                where: { 
                    id: slotId,
                    nailMaster: { id: masterId },
                    status: ScheduleStatus.AVAILABLE
                }
            });

            if (!slot) {
                ResponseUtil.error(res, 'Временное окно не найдено или недоступно', 404);
                return;
            }

            slot.status = ScheduleStatus.BOOKED;
            slot.notes = orderId ? `Забронировано для заказа: ${orderId}` : 'Забронировано';

            const updatedSlot = await scheduleRepository.save(slot);
            ResponseUtil.success(res, 'Временное окно заблокировано', updatedSlot);
        } catch (error) {
            console.error('Ошибка блокировки временного окна:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }

    /**
     * Разблокировать временное окно (отмена бронирования)
     */
    static async unblockTimeSlot(req: Request, res: Response): Promise<void> {
        try {
            const { masterId, slotId } = req.params;

            if (!uuidValidate(masterId) || !uuidValidate(slotId)) {
                ResponseUtil.error(res, 'Невалидные ID', 400);
                return;
            }

            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const slot = await scheduleRepository.findOne({
                where: { 
                    id: slotId,
                    nailMaster: { id: masterId },
                    status: ScheduleStatus.BOOKED
                }
            });

            if (!slot) {
                ResponseUtil.error(res, 'Временное окно не найдено или не забронировано', 404);
                return;
            }

            slot.status = ScheduleStatus.AVAILABLE;
            slot.notes = undefined;

            const updatedSlot = await scheduleRepository.save(slot);
            ResponseUtil.success(res, 'Временное окно разблокировано', updatedSlot);
        } catch (error) {
            console.error('Ошибка разблокировки временного окна:', error);
            ResponseUtil.error(res, 'Внутренняя ошибка сервера');
        }
    }
} 