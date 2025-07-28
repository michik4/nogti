#!/usr/bin/env node

// Загружаем переменные окружения в первую очередь
import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { AppDataSource } from '../conf/orm.conf';
import { MigrationUtils } from '../utils/db/migration.util';
import { getDbConfig, getOrmConfig } from '../conf/global.conf';
import SeedRunner from '../seeds/index';
import { ConsoleUtil } from '../utils/console.util';

// Получаем конфигурацию базы данных
const dbConfig = getDbConfig();
const ormConfig = getOrmConfig();


/**
 * CLI утилита для работы с базой данных
 */
class DatabaseCLI {
  private migrationUtils: MigrationUtils;

  constructor() {
    this.migrationUtils = new MigrationUtils(AppDataSource);
  }

  /**
   * Инициализация подключения к БД
   */
  async initialize(): Promise<void> {
    try {
      await AppDataSource.initialize();
      ConsoleUtil.showSuccess('Подключение к базе данных установлено');
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      process.exit(1);
    }
  }

  /**
   * Закрытие подключения к БД
   */
  async close(): Promise<void> {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        ConsoleUtil.showInfo('Подключение к базе данных закрыто');
      }
    } catch (error) {
      console.error('❌ Ошибка закрытия подключения:', error);
    }
  }

  /**
   * Выполнение команд
   */
  async run(): Promise<void> {
    const command = process.argv[2];
    const argument = process.argv[3];

    try {
      await this.initialize();

      switch (command) {
        case 'migration:generate':
          if (!argument) {
            console.error('❌ Укажите название миграции: npm run db migration:generate <name>');
            process.exit(1);
          }
          await this.migrationUtils.generateMigration(argument);
          break;

        case 'migration:create':
          if (!argument) {
            console.error('❌ Укажите название миграции: npm run db migration:create <name>');
            process.exit(1);
          }
          await this.migrationUtils.createEmptyMigration(argument);
          break;

        case 'migration:run':
          await this.migrationUtils.runMigrations();
          break;

        case 'migration:revert':
          await this.migrationUtils.revertMigration();
          break;

        case 'migration:status':
          await this.migrationUtils.showMigrationStatus();
          break;

        case 'seed:run':
          if (argument) {
            ConsoleUtil.showProcess(`Выполнение конкретного сида: ${argument}`);
            await SeedRunner.runSeed(argument + '.ts');
          } else {
            await SeedRunner.runAll(AppDataSource);
          }
          break;

        case 'seed:status':
          await SeedRunner.showStatus(AppDataSource);
          break;

        case 'seed:reset':
          await SeedRunner.resetSeeds(AppDataSource);
          break;

        case 'db:drop':
          await this.dropDatabase();
          break;

        case 'db:create':
          await this.createDatabase();
          break;

        case 'db:reset':
          await this.resetDatabase();
          break;

        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Ошибка выполнения команды:', error);
      process.exit(1);
    } finally {
      await this.close();
    }
  }

  /**
   * Удаление базы данных
   */
  private async dropDatabase(): Promise<void> {
    ConsoleUtil.showProcess('Удаление всех таблиц...');
    await AppDataSource.dropDatabase();
    ConsoleUtil.showSuccess('База данных очищена');
  }

  /**
   * Создание схемы базы данных
   */
  private async createDatabase(): Promise<void> {
    ConsoleUtil.showProcess('Создание схемы базы данных...');
    await AppDataSource.synchronize();
    ConsoleUtil.showSuccess('Схема базы данных создана');
  }

  /**
   * Сброс базы данных (удаление + создание + миграции + сиды)
   */
  private async resetDatabase(): Promise<void> {
    ConsoleUtil.showProcess('Полный сброс базы данных...');
    
    // Удаляем все таблицы
    await this.dropDatabase();
    
    // Выполняем миграции
    await this.migrationUtils.runMigrations();
    
    // Выполняем сиды
    await SeedRunner.runAll(AppDataSource);
    
    ConsoleUtil.showSuccess('База данных полностью сброшена и настроена');
  }

  /**
   * Показать справку
   */
  private showHelp(): void {
    console.log(`
🗄️  Утилита управления базой данных

Использование: npm run db <command> [options]

Команды миграций:
  migration:generate <name>  Генерировать новую миграцию на основе изменений в сущностях
  migration:create <name>    Создать пустую миграцию
  migration:run             Выполнить все ожидающие миграции
  migration:revert          Откатить последнюю миграцию
  migration:status          Показать статус миграций

Команды сидов:
  seed:run                  Выполнить все сиды
  seed:run [name]           Выполнить конкретный сид
  seed:status               Показать статус сидов
  seed:reset                Сбросить все сиды

Команды базы данных:
  db:drop                   Удалить все таблицы
  db:create                 Создать схему базы данных
  db:reset                  Полный сброс (drop + migrations + seeds)

Общие:
  help                      Показать эту справку

Примеры:
  npm run db migration:generate create-users-table
  npm run db migration:run
  npm run db seed:run
  npm run db db:reset
    `);
  }
}

// Запуск CLI
const cli = new DatabaseCLI();
cli.run(); 