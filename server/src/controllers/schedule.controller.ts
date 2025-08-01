import { Response, Request } from 'express';
import { AppDataSource } from '../conf/orm.conf';
import { ScheduleEntity, ScheduleStatus } from '../entities/schedule.entity';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api.type';
import { ResponseUtil } from '../utils/response.util';
import { validate as uuidValidate } from 'uuid';

export class ScheduleController {
    /**
     * Получить расписание мастера
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

            // Группируем по датам
            const scheduleByDate: { [date: string]: ScheduleEntity[] } = {};
            schedules.forEach(schedule => {
                // workDate может быть строкой или Date объектом
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
     * Получить расписание текущего мастера
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

            // Группируем по датам
            const scheduleByDate: { [date: string]: ScheduleEntity[] } = {};
            schedules.forEach(schedule => {
                // workDate может быть строкой или Date объектом
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

            // Валидация данных
            if (!workDate || !startTime || !endTime) {
                ResponseUtil.error(res, 'Необходимо указать дату, время начала и окончания', 400);
                return;
            }

            // Проверяем, что пользователь - мастер
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: userId } });

            if (!master) {
                ResponseUtil.error(res, 'Мастер не найден', 404);
                return;
            }

            // Проверяем, что время окончания больше времени начала
            if (startTime >= endTime) {
                ResponseUtil.error(res, 'Время окончания должно быть больше времени начала', 400);
                return;
            }

            // Проверяем, что дата не в прошлом
            const workDateObj = new Date(workDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (workDateObj < today) {
                ResponseUtil.error(res, 'Нельзя создавать временные окна в прошлом', 400);
                return;
            }

            // Проверяем, нет ли пересечений с существующими окнами
            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const conflictingSlots = await scheduleRepository.find({
                where: {
                    nailMaster: { id: userId },
                    workDate: workDateObj
                }
            });

            console.log(`Проверка пересечений для даты ${workDate}, новых окон: ${startTime}-${endTime}`);
            console.log(`Найдено существующих окон: ${conflictingSlots.length}`);
            console.log('Существующие окна:', conflictingSlots.map(slot => `${slot.startTime}-${slot.endTime} (${slot.status})`));

            for (const slot of conflictingSlots) {
                // Проверяем пересечение временных интервалов
                const newStart = startTime;
                const newEnd = endTime;
                const existingStart = slot.startTime;
                const existingEnd = slot.endTime;
                
                console.log(`Сравниваем: новое ${newStart}-${newEnd} с существующим ${existingStart}-${existingEnd} (статус: ${slot.status})`);
                
                // Проверяем точное совпадение
                if (newStart === existingStart && newEnd === existingEnd) {
                    console.log(`Найдено точное совпадение! Новое: ${newStart}-${newEnd}, Существующее: ${existingStart}-${existingEnd}`);
                    ResponseUtil.error(res, `Временное окно с таким же временем уже существует (${existingStart}-${existingEnd})`, 409);
                    return;
                }
                
                // Проверяем, есть ли пересечение
                // Два интервала пересекаются, если:
                // 1. Начало нового интервала находится внутри существующего ИЛИ
                // 2. Конец нового интервала находится внутри существующего ИЛИ
                // 3. Новый интервал полностью содержит существующий
                if (
                    (newStart >= existingStart && newStart < existingEnd) ||
                    (newEnd > existingStart && newEnd <= existingEnd) ||
                    (newStart <= existingStart && newEnd >= existingEnd)
                ) {
                    console.log(`Найдено пересечение! Новое: ${newStart}-${newEnd}, Существующее: ${existingStart}-${existingEnd}`);
                    ResponseUtil.error(res, `Временное окно пересекается с существующим (${existingStart}-${existingEnd})`, 409);
                    return;
                }
            }

            // Создаем новое временное окно
            const newSlot = new ScheduleEntity();
            newSlot.nailMaster = master;
            newSlot.workDate = workDateObj;
            newSlot.startTime = startTime;
            newSlot.endTime = endTime;
            newSlot.status = status as ScheduleStatus;
            newSlot.notes = notes;

            const savedSlot = await scheduleRepository.save(newSlot);
            console.log(`Временное окно успешно добавлено: ${savedSlot.startTime}-${savedSlot.endTime} на ${savedSlot.workDate}`);
            ResponseUtil.success(res, 'Временное окно добавлено', savedSlot);
        } catch (error) {
            console.error('Ошибка добавления временного окна:', error);
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
     * Получить доступные временные окна для бронирования
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
            const availableSlots = await scheduleRepository.find({
                where: {
                    nailMaster: { id: masterId },
                    workDate: new Date(date),
                    status: ScheduleStatus.AVAILABLE
                },
                order: {
                    startTime: 'ASC'
                }
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