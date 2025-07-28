import { DataSource } from 'typeorm';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ConsoleUtil } from '../console.util';

/**
 * Утилиты для работы с миграциями
 */
export class MigrationUtils {
  constructor(private dataSource: DataSource) {}

  /**
   * Генерирует новую миграцию
   */
  async generateMigration(name: string, outputDir: string = 'src/migrations'): Promise<string> {
    try {
      // Создаем директорию если её нет
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Генерируем timestamp
      const timestamp = Date.now();
      const className = this.toPascalCase(name);
      const fileName = `${timestamp}-${name}.ts`;
      const filePath = join(outputDir, fileName);

      // Проверяем изменения в схеме
      const sqlInMemory = await this.dataSource.driver.createSchemaBuilder().log();
      
      if (sqlInMemory.upQueries.length === 0) {
        throw new Error('Изменений в схеме не обнаружено');
      }

      // Генерируем содержимое миграции
      const migrationContent = this.generateMigrationContent(className, sqlInMemory);

      // Записываем файл
      writeFileSync(filePath, migrationContent);

      ConsoleUtil.showSuccess(`Миграция создана: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Ошибка создания миграции:', error);
      throw error;
    }
  }

  /**
   * Создает пустую миграцию
   */
  async createEmptyMigration(name: string, outputDir: string = 'src/migrations'): Promise<string> {
    try {
      // Создаем директорию если её нет
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Генерируем timestamp
      const timestamp = Date.now();
      const className = this.toPascalCase(name);
      const fileName = `${timestamp}-${name}.ts`;
      const filePath = join(outputDir, fileName);

      // Генерируем содержимое пустой миграции
      const migrationContent = this.generateEmptyMigrationContent(className);

      // Записываем файл
      writeFileSync(filePath, migrationContent);

      ConsoleUtil.showSuccess(`Пустая миграция создана: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Ошибка создания пустой миграции:', error);
      throw error;
    }
  }

  /**
   * Выполняет миграции
   */
  async runMigrations(): Promise<void> {
    try {
      ConsoleUtil.showProcess('Выполнение миграций...');
      const migrations = await this.dataSource.runMigrations({ transaction: 'each' });
      
      if (migrations.length === 0) {
        ConsoleUtil.showInfo('Нет новых миграций для выполнения');
      } else {
        ConsoleUtil.showSuccess(`Выполнено миграций: ${migrations.length}`);
        migrations.forEach(migration => {
          console.log(`  - ${migration.name}`);
        });
      }
    } catch (error) {
      console.error('❌ Ошибка выполнения миграций:', error);
      throw error;
    }
  }

  /**
   * Откатывает последнюю миграцию
   */
  async revertMigration(): Promise<void> {
    try {
      ConsoleUtil.showProcess('Откат последней миграции...');
      await this.dataSource.undoLastMigration({ transaction: 'each' });
      ConsoleUtil.showSuccess('Последняя миграция отменена');
    } catch (error) {
      console.error('❌ Ошибка отката миграции:', error);
      throw error;
    }
  }

  /**
   * Показывает статус миграций
   */
  async showMigrationStatus(): Promise<void> {
    try {
      const [executedMigrations, pendingMigrations] = await Promise.all([
        this.dataSource.query(`SELECT * FROM migrations ORDER BY timestamp`),
        this.dataSource.migrations
      ]);
      
      ConsoleUtil.showSectionHeader('Статус миграций');
      
      if (pendingMigrations.length === 0) {
        ConsoleUtil.showInfo('Миграций не найдено');
        return;
      }

      const executedNames = executedMigrations.map((m: any) => m.name);

      pendingMigrations.forEach((migration: any) => {
        const isExecuted = executedNames.includes(migration.name);
        const status = isExecuted ? '✅ Выполнена' : '⏳ Ожидает';
        console.log(`  ${status}: ${migration.name}`);
      });
    } catch (error) {
      console.error('❌ Ошибка получения статуса миграций:', error);
      throw error;
    }
  }

  /**
   * Генерирует содержимое миграции
   */
  private generateMigrationContent(className: string, sqlInMemory: any): string {
    const upQueries = sqlInMemory.upQueries.map((query: any) => 
      `        await queryRunner.query(\`${query.query.replace(/`/g, '\\`')}\`);`
    ).join('\n');

    const downQueries = sqlInMemory.downQueries.map((query: any) => 
      `        await queryRunner.query(\`${query.query.replace(/`/g, '\\`')}\`);`
    ).join('\n');

    return `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className}${Date.now()} implements MigrationInterface {
    name = '${className}${Date.now()}';

    public async up(queryRunner: QueryRunner): Promise<void> {
${upQueries}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
${downQueries}
    }
}
`;
  }

  /**
   * Генерирует содержимое пустой миграции
   */
  private generateEmptyMigrationContent(className: string): string {
    return `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className}${Date.now()} implements MigrationInterface {
    name = '${className}${Date.now()}';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // TODO: Добавьте SQL команды для применения миграции
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // TODO: Добавьте SQL команды для отката миграции
    }
}
`;
  }

  /**
   * Преобразует строку в PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
  }
} 