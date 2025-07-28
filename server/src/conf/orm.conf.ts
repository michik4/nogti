import { DataSource } from "typeorm";
import CONFIG, { getDbConfig, getOrmConfig } from "./global.conf";
import { ConsoleUtil } from "../utils/console.util";

// Entities
import { UserEntity } from "../entities/user.entity";
import { NailMasterEntity } from "../entities/nailmaster.entity";
import { OrderEntity } from "../entities/order.entity";
import { MasterDesignEntity } from "../entities/master-design.entity";
import { ScheduleEntity } from "../entities/schedule.entity";
import { NailDesignEntity } from "../entities/nail-design.entity";
import { ReviewEntity } from "../entities/review.entity";
import { AdminEntity } from "../entities/admin.entity";
import { ClientEntity } from "../entities/client.entity";
import { MasterServiceEntity } from "../entities/master-service.entity";
import { MasterServiceDesignEntity } from "../entities/master-service-design.entity";
import { MasterRatingEntity } from "../entities";


const dbConfig = getDbConfig();
const ormConfig = getOrmConfig();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.NAME,
    entities: [
        // Базовые сущности
        UserEntity,
        NailDesignEntity,
        // Наследуемые сущности
        ClientEntity,
        AdminEntity,
        NailMasterEntity,
        // Связанные сущности
        MasterRatingEntity,
        OrderEntity,
        MasterDesignEntity,
        ScheduleEntity,
        MasterServiceEntity,
        MasterServiceDesignEntity,
        ReviewEntity
    ],
    migrations: [__dirname + "/../migrations/*.ts"],
    synchronize: ormConfig.SYNCHRONIZE,
    logging: ormConfig.LOGGING,
    logger: "advanced-console",
    maxQueryExecutionTime: ormConfig.MAX_QUERY_EXECUTION_TIME,
    cache: ormConfig.CACHE,
});

// Функция для инициализации подключения
export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        ConsoleUtil.showSuccess('TypeORM подключен к PostgreSQL');

        // Проверяем подключение
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const result = await queryRunner.query('SELECT NOW() as current_time');
        ConsoleUtil.showInfo(`Текущее время сервера БД: ${result[0].current_time}`);
        await queryRunner.release();

    } catch (error) {
        console.error('❌ Ошибка подключения TypeORM:', error);
        throw error;
    }
};

// Функция для закрытия подключения
export const closeDatabase = async (): Promise<void> => {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            ConsoleUtil.showInfo('TypeORM отключен от PostgreSQL');
        }
    } catch (error) {
        console.error('❌ Ошибка при закрытии TypeORM:', error);
        throw error;
    }
}; 