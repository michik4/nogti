// Базовые сущности
export { UserEntity, Role } from './user.entity';
export { AdminEntity } from './admin.entity';
export { ClientEntity } from './client.entity';
export { NailMasterEntity } from './nailmaster.entity';

// Основные сущности бизнес-логики
export { NailDesignEntity, DesignType, DesignSource } from './nail-design.entity';
export { OrderEntity, OrderStatus } from './order.entity';
export { ReviewEntity } from './review.entity';
export { ScheduleEntity, ScheduleStatus } from './schedule.entity';
export { NotificationEntity, NotificationType } from './notification.entity';
export { MasterDesignEntity } from './master-design.entity';
export { MasterServiceEntity } from './master-service.entity';
export { MasterServiceDesignEntity } from './master-service-design.entity';
export { MasterRatingEntity } from './master-rating.entity';
export { OrderDesignSnapshotEntity } from './order-design-snapshot.entity';