import { AppDataSource } from '../conf/orm.conf';
import { ScheduleEntity, ScheduleStatus } from '../entities/schedule.entity';
import { OrderEntity } from '../entities/order.entity';

export class ScheduleUtil {
    /**
     * Блокирует временное окно для заказа
     */
    static async blockTimeSlotForOrder(order: OrderEntity): Promise<void> {
        try {
            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const orderTime = order.requestedDateTime.toTimeString().substring(0, 5); // HH:MM
            const orderDate = order.requestedDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Ищем временное окно, которое соответствует времени заказа
            const timeSlot = await scheduleRepository.findOne({
                where: {
                    nailMaster: { id: order.nailMaster.id },
                    workDate: new Date(orderDate),
                    startTime: orderTime,
                    status: ScheduleStatus.AVAILABLE
                }
            });

            if (timeSlot) {
                // Блокируем временное окно
                timeSlot.status = ScheduleStatus.BOOKED;
                timeSlot.notes = `Забронировано для заказа: ${order.id}`;
                await scheduleRepository.save(timeSlot);
                console.log(`Временное окно заблокировано для заказа ${order.id}`);
            } else {
                console.log(`Временное окно не найдено для заказа ${order.id} (время: ${orderTime}, дата: ${orderDate})`);
            }
        } catch (error) {
            console.error('Ошибка при блокировке временного окна:', error);
            throw error;
        }
    }

    /**
     * Блокирует временное окно для предложенного времени заказа
     */
    static async blockTimeSlotForProposedTime(order: OrderEntity): Promise<void> {
        if (!order.proposedDateTime) {
            console.log('Нет предложенного времени для блокировки');
            return;
        }

        try {
            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const orderTime = order.proposedDateTime.toTimeString().substring(0, 5); // HH:MM
            const orderDate = order.proposedDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Ищем временное окно, которое соответствует предложенному времени
            const timeSlot = await scheduleRepository.findOne({
                where: {
                    nailMaster: { id: order.nailMaster.id },
                    workDate: new Date(orderDate),
                    startTime: orderTime,
                    status: ScheduleStatus.AVAILABLE
                }
            });

            if (timeSlot) {
                // Блокируем временное окно
                timeSlot.status = ScheduleStatus.BOOKED;
                timeSlot.notes = `Забронировано для заказа: ${order.id}`;
                await scheduleRepository.save(timeSlot);
                console.log(`Временное окно заблокировано для заказа ${order.id} (предложенное время)`);
            } else {
                console.log(`Временное окно не найдено для заказа ${order.id} (предложенное время: ${orderTime}, дата: ${orderDate})`);
            }
        } catch (error) {
            console.error('Ошибка при блокировке временного окна:', error);
            throw error;
        }
    }

    /**
     * Разблокирует временное окно для заказа
     */
    static async unblockTimeSlotForOrder(order: OrderEntity): Promise<void> {
        if (!order.confirmedDateTime) {
            console.log('Нет подтвержденного времени для разблокировки');
            return;
        }

        try {
            const scheduleRepository = AppDataSource.getRepository(ScheduleEntity);
            const orderTime = order.confirmedDateTime.toTimeString().substring(0, 5); // HH:MM
            const orderDate = order.confirmedDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Ищем заблокированное временное окно для этого заказа
            const timeSlot = await scheduleRepository.findOne({
                where: {
                    nailMaster: { id: order.nailMaster.id },
                    workDate: new Date(orderDate),
                    startTime: orderTime,
                    status: ScheduleStatus.BOOKED,
                    notes: `Забронировано для заказа: ${order.id}`
                }
            });

            if (timeSlot) {
                // Разблокируем временное окно
                timeSlot.status = ScheduleStatus.AVAILABLE;
                timeSlot.notes = undefined;
                await scheduleRepository.save(timeSlot);
                console.log(`Временное окно разблокировано для заказа ${order.id}`);
            } else {
                console.log(`Заблокированное временное окно не найдено для заказа ${order.id}`);
            }
        } catch (error) {
            console.error('Ошибка при разблокировке временного окна:', error);
            throw error;
        }
    }
} 