import { AppDataSource } from '../conf/orm.conf';
import { readdirSync } from 'fs';
import { join } from 'path';
import { TableUtil } from '../utils/table.util';
import { FormatUtil } from '../utils/format.util';
import { ConsoleUtil } from '../utils/console.util';

/**
 * Главный класс для запуска всех сидов
 */
export default class SeedRunner {
  /**
   * Запустить все сиды в правильном порядке
   */
  static async runAll(dataSource = AppDataSource): Promise<void> {
    ConsoleUtil.showSectionHeader('Запуск всех сидов');

    try {
      // Создаем таблицу для отслеживания выполненных сидов
      await SeedRunner.createSeedsTable(dataSource);

      // Получаем список файлов сидов
      const seedFiles = SeedRunner.getSeedFiles();
      
      if (seedFiles.length === 0) {
        ConsoleUtil.showInfo('Сиды не найдены');
        return;
      }

      // Выполняем каждый сид
      for (const seedFile of seedFiles) {
        await SeedRunner.runSeed(seedFile, dataSource);
      }

      ConsoleUtil.showSuccess('Все сиды выполнены успешно');
    } catch (error) {
      console.error('❌ Ошибка выполнения сидов:', error);
      throw error;
    }
  }

  /**
   * Показать статус всех сидов
   */
  static async showStatus(dataSource = AppDataSource): Promise<void> {
    ConsoleUtil.showSectionHeader('Статус сидов');

    try {
      // Создаем таблицу для отслеживания выполненных сидов
      await SeedRunner.createSeedsTable(dataSource);

      // Получаем список файлов сидов
      const seedFiles = SeedRunner.getSeedFiles();
      
      if (seedFiles.length === 0) {
        ConsoleUtil.showInfo('Сиды не найдены');
        return;
      }

      // Получаем выполненные сиды
      const executedSeeds = await SeedRunner.getExecutedSeeds(dataSource);
      
      // Создаем таблицу
      const table = TableUtil.createSeedsStatusTable();

      // Заполняем таблицу данными
      for (const seedFile of seedFiles) {
        const seedName = seedFile.replace('.ts', '').replace('.js', '');
        if (seedName === 'index') continue;

        const executed = executedSeeds.find(s => s.name === seedName);
        const status = FormatUtil.formatSeedStatus(!!executed);
        const date = FormatUtil.formatDate(executed?.executed_at || '');
        
        table.push([seedName, status, date]);
      }

      // Выводим таблицу
      console.log(table.toString());
      
      // Показываем статистику
      const totalSeeds = seedFiles.filter(f => !f.includes('index')).length;
      const executedCount = executedSeeds.length;
      ConsoleUtil.showSeedsStatistics(executedCount, totalSeeds);

    } catch (error) {
      console.error('❌ Ошибка получения статуса сидов:', error);
      throw error;
    }
  }

  /**
   * Сброс всех сидов (удаление записей о выполнении)
   */
  static async resetSeeds(dataSource = AppDataSource): Promise<void> {
    ConsoleUtil.showProcess('Сброс всех сидов...');

    try {
      // Создаем таблицу для отслеживания выполненных сидов
      await SeedRunner.createSeedsTable(dataSource);

      // Получаем количество записей перед сбросом
      const beforeCount = await SeedRunner.getExecutedSeedsCount(dataSource);
      
      if (beforeCount === 0) {
        ConsoleUtil.showInfo('Нет выполненных сидов для сброса');
        return;
      }

      // Удаляем все записи о выполненных сидах
      await dataSource.query('DELETE FROM seeds');
      
      ConsoleUtil.showSuccess(`Сброшено ${beforeCount} записей о выполненных сидах`);
      ConsoleUtil.showInfo('Теперь все сиды могут быть выполнены заново');

    } catch (error) {
      console.error('❌ Ошибка сброса сидов:', error);
      throw error;
    }
  }

  /**
   * Выполняет конкретный сид
   */
  static async runSeed(seedFileName: string, dataSource = AppDataSource): Promise<void> {
    try {
      const seedName = seedFileName.replace('.ts', '').replace('.js', '');
      
      // Пропускаем файл index.ts
      if (seedName === 'index') {
        return;
      }
      
      // Проверяем, был ли сид уже выполнен
      const isExecuted = await SeedRunner.isSeedExecuted(seedName, dataSource);
      if (isExecuted) {
        ConsoleUtil.showInfo(`Сид ${seedName} уже выполнен, пропускаем`);
        return;
      }

      // Импортируем и выполняем сид
      const relativePath = `./${seedFileName.replace('.ts', '')}`;
      const seedModule = await import(relativePath);
      const seedClass = seedModule.default;

      if (!seedClass || typeof seedClass.run !== 'function') {
        throw new Error(`Сид ${seedName} должен экспортировать класс с методом run`);
      }

      ConsoleUtil.showProcess(`Выполнение сида: ${seedName}`);
      await seedClass.run(dataSource);

      // Отмечаем сид как выполненный
      await SeedRunner.markSeedAsExecuted(seedName, dataSource);
      ConsoleUtil.showSuccess(`Сид ${seedName} выполнен успешно`);

    } catch (error) {
      console.error(`❌ Ошибка выполнения сида ${seedFileName}:`, error);
      throw error;
    }
  }

  /**
   * Создает таблицу для отслеживания выполненных сидов
   */
  private static async createSeedsTable(dataSource = AppDataSource): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await dataSource.query(query);
  }

  /**
   * Проверяет, был ли сид выполнен
   */
  private static async isSeedExecuted(seedName: string, dataSource = AppDataSource): Promise<boolean> {
    const result = await dataSource.query(
      'SELECT COUNT(*) as count FROM seeds WHERE name = $1',
      [seedName]
    );
    return parseInt(result[0].count) > 0;
  }

  /**
   * Отмечает сид как выполненный
   */
  private static async markSeedAsExecuted(seedName: string, dataSource = AppDataSource): Promise<void> {
    await dataSource.query(
      'INSERT INTO seeds (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [seedName]
    );
  }

  /**
   * Получает список файлов сидов
   */
  private static getSeedFiles(): string[] {
    try {
      const seedsDir = __dirname;
      return readdirSync(seedsDir)
        .filter(file => (file.endsWith('.ts') || file.endsWith('.js')) && file !== 'index.ts' && file !== 'index.js')
        .sort();
    } catch (error) {
      console.error('❌ Ошибка чтения директории сидов:', error);
      return [];
    }
  }

  /**
   * Получает список выполненных сидов
   */
  private static async getExecutedSeeds(dataSource = AppDataSource): Promise<Array<{name: string, executed_at: string}>> {
    const result = await dataSource.query('SELECT name, executed_at FROM seeds ORDER BY executed_at');
    return result;
  }

  /**
   * Получает количество выполненных сидов
   */
  private static async getExecutedSeedsCount(dataSource = AppDataSource): Promise<number> {
    const result = await dataSource.query('SELECT COUNT(*) as count FROM seeds');
    return parseInt(result[0].count);
  }
}
