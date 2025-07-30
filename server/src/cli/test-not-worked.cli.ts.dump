#!/usr/bin/env node

// Загружаем переменные окружения в первую очередь
import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { existsSync } from 'fs';
import { join } from 'path';
import { ConsoleUtil } from '../utils/console.util';
import { TableUtil } from '../utils/table.util';
import { FormatUtil } from '../utils/format.util';
import { AppDataSource } from '../conf/orm.conf';
import { TestHelper } from '../tests/helpers/test.helper';
import { TestFramework, TestSuite } from '../tests/framework/test.framework';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuiteResult {
  name: string;
  results: TestResult[];
  duration: number;
}

export class TestCLI {
  private static testResults: TestSuiteResult[] = [];

  /**
   * Главное меню CLI тестов
   */
  static async run(args: string[]): Promise<void> {
    const command = args[0];

    switch (command) {
      case 'run':
        await this.runTests(args.slice(1));
        break;
      case 'clean':
        await this.cleanTestData();
        break;
      case 'setup':
        await this.setupTestEnvironment();
        break;
      case 'status':
        await this.showTestStatus();
        break;
      case 'help':
      default:
        this.showHelp();
        break;
    }
  }

  /**
   * Запуск тестов
   */
  private static async runTests(args: string[]): Promise<void> {
    ConsoleUtil.showSectionHeader('Запуск тестов');

    const options = this.parseTestOptions(args);
    
    try {
      await this.prepareTestEnvironment();
      
      ConsoleUtil.showInfo('Запуск тестов...');
      ConsoleUtil.showSeparator();

      const startTime = Date.now();
      await this.executeTests(options);
      const duration = Date.now() - startTime;

      ConsoleUtil.showSeparator();
      ConsoleUtil.showSuccess(`Тесты завершены за ${FormatUtil.formatDuration(duration)}`);

      await this.showTestResults();

    } catch (error) {
      ConsoleUtil.showError(`Ошибка выполнения тестов: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Выполнение тестов
   */
  private static async executeTests(options: any): Promise<void> {
    const testFiles = this.findTestFiles();
    
    for (const testFile of testFiles) {
      if (options.testFile && !testFile.path.includes(options.testFile)) {
        continue;
      }

      try {
        // Очищаем предыдущие тесты
        TestFramework.clearSuites();
        
        // Импортируем тестовый файл
        await import(testFile.path);
        
        // Получаем все тестовые наборы
        const suites = TestFramework.getSuites();
        
        for (const suite of suites) {
          const suiteStartTime = Date.now();
          const suiteResults: TestResult[] = [];

          try {
            // Запускаем beforeAll если есть
            if (suite.beforeAll) {
              await suite.beforeAll();
            }

            // Запускаем тесты
            for (const test of suite.tests) {
              const startTime = Date.now();
              
              try {
                // Запускаем beforeEach если есть
                if (suite.beforeEach) {
                  await suite.beforeEach();
                }

                await test.fn();
                
                // Запускаем afterEach если есть
                if (suite.afterEach) {
                  await suite.afterEach();
                }

                suiteResults.push({
                  name: test.name,
                  passed: true,
                  duration: Date.now() - startTime
                });

              } catch (error) {
                suiteResults.push({
                  name: test.name,
                  passed: false,
                  error: error instanceof Error ? error.message : String(error),
                  duration: Date.now() - startTime
                });

                if (options.bail) {
                  break;
                }
              }
            }

            // Запускаем afterAll если есть
            if (suite.afterAll) {
              await suite.afterAll();
            }

          } catch (error) {
            ConsoleUtil.showError(`Ошибка в наборе тестов ${suite.name}: ${error}`);
          }

          this.testResults.push({
            name: `${testFile.name} - ${suite.name}`,
            results: suiteResults,
            duration: Date.now() - suiteStartTime
          });
        }

      } catch (error) {
        ConsoleUtil.showError(`Ошибка загрузки теста ${testFile.name}: ${error}`);
      }
    }
  }

  /**
   * Очистка тестовых данных
   */
  private static async cleanTestData(): Promise<void> {
    ConsoleUtil.showSectionHeader('Очистка тестовых данных');

    try {
      if (!AppDataSource.isInitialized) {
        ConsoleUtil.showProcess('Инициализация подключения к базе данных...');
        await AppDataSource.initialize();
      }

      ConsoleUtil.showProcess('Очистка тестовых данных...');
      await TestHelper.cleanup();

      ConsoleUtil.showSuccess('Тестовые данные очищены');

    } catch (error) {
      ConsoleUtil.showError(`Ошибка очистки тестовых данных: ${error}`);
    } finally {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    }
  }

  /**
   * Настройка тестового окружения
   */
  private static async setupTestEnvironment(): Promise<void> {
    ConsoleUtil.showSectionHeader('Настройка тестового окружения');

    try {
      // Проверка тестовых файлов
      ConsoleUtil.showProcess('Проверка тестовых файлов...');
      const testFiles = this.findTestFiles();
      
      const table = TableUtil.createTestFilesTable();
      testFiles.forEach(file => {
        const status = existsSync(file.path) ? '✅ Найден' : '❌ Отсутствует';
        table.push([file.name, file.path, status]);
      });

      console.log(table.toString());

      // Проверка подключения к БД
      ConsoleUtil.showProcess('Проверка подключения к базе данных...');
      await this.checkDatabaseConnection();

      ConsoleUtil.showSuccess('Тестовое окружение настроено корректно');

    } catch (error) {
      ConsoleUtil.showError(`Ошибка настройки тестового окружения: ${error}`);
    }
  }

  /**
   * Показ статуса тестов
   */
  private static async showTestStatus(): Promise<void> {
    ConsoleUtil.showSectionHeader('Статус тестовой системы');

    try {
      // Количество тестовых файлов
      const testFiles = this.findTestFiles();
      ConsoleUtil.showKeyValue('Тестовых файлов', testFiles.length.toString());

      // Статус базы данных
      await this.showDatabaseStatus();

    } catch (error) {
      ConsoleUtil.showError(`Ошибка получения статуса: ${error}`);
    }
  }

  /**
   * Парсинг опций для тестов
   */
  private static parseTestOptions(args: string[]): any {
    const options: any = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--file':
        case '-f':
          options.testFile = args[++i];
          break;
        case '--pattern':
        case '-p':
          options.testPattern = args[++i];
          break;
        case '--bail':
        case '-b':
          options.bail = true;
          break;
        case '--silent':
        case '-s':
          options.silent = true;
          break;
      }
    }

    return options;
  }

  /**
   * Подготовка тестового окружения
   */
  private static async prepareTestEnvironment(): Promise<void> {
    ConsoleUtil.showProcess('Подготовка тестового окружения...');
    
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'test';
    }

    // Очищаем результаты предыдущих тестов
    this.testResults = [];

    ConsoleUtil.showInfo('Тестовое окружение подготовлено');
  }

  /**
   * Показ результатов тестов
   */
  private static async showTestResults(): Promise<void> {
    ConsoleUtil.showSectionHeader('Результаты тестов');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalDuration = 0;

    for (const suite of this.testResults) {
      ConsoleUtil.showInfo(`\nНабор тестов: ${suite.name}`);
      
      for (const result of suite.results) {
        totalTests++;
        if (result.passed) {
          passedTests++;
          ConsoleUtil.showSuccess(`  ✓ ${result.name} (${result.duration}ms)`);
        } else {
          failedTests++;
          ConsoleUtil.showError(`  ✗ ${result.name} (${result.duration}ms)`);
          if (result.error) {
            ConsoleUtil.showError(`    ${result.error}`);
          }
        }
      }

      totalDuration += suite.duration;
    }

    ConsoleUtil.showSeparator();
    ConsoleUtil.showKeyValue('Всего тестов', totalTests.toString());
    ConsoleUtil.showKeyValue('Пройдено', FormatUtil.formatSuccess(passedTests.toString()));
    ConsoleUtil.showKeyValue('Провалено', FormatUtil.formatError(failedTests.toString()));
    ConsoleUtil.showKeyValue('Общее время', FormatUtil.formatDuration(totalDuration));

    if (failedTests === 0) {
      ConsoleUtil.showSuccess('\nВсе тесты пройдены успешно! 🎉');
    } else {
      ConsoleUtil.showError(`\n${failedTests} тестов провалено`);
      process.exit(1);
    }
  }

  /**
   * Поиск тестовых файлов
   */
  private static findTestFiles(): Array<{name: string, path: string}> {
    const testDir = join(process.cwd(), 'src', 'tests');
    return [
      { name: 'Auth Tests', path: join(testDir, 'auth.test.ts') },
      { name: 'Designs Tests', path: join(testDir, 'designs.test.ts') },
      { name: 'Masters Tests', path: join(testDir, 'masters.test.ts') },
      { name: 'Orders Tests', path: join(testDir, 'orders.test.ts') }
    ];
  }

  /**
   * Проверка подключения к базе данных
   */
  private static async checkDatabaseConnection(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      await AppDataSource.query('SELECT 1');
      ConsoleUtil.showInfo('✅ Подключение к базе данных работает');
      
      await AppDataSource.destroy();
    } catch (error) {
      ConsoleUtil.showWarning(`❌ Ошибка подключения к базе данных: ${error}`);
    }
  }

  /**
   * Показ статуса базы данных
   */
  private static async showDatabaseStatus(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const result = await AppDataSource.query('SELECT version()');
      const dbVersion = result[0]?.version || 'Неизвестно';
      
      ConsoleUtil.showKeyValue('База данных', dbVersion.split(' ')[0]);
      ConsoleUtil.showKeyValue('Статус подключения', '🟢 Подключено');

      await AppDataSource.destroy();
    } catch (error) {
      ConsoleUtil.showKeyValue('Статус подключения', '🔴 Ошибка подключения');
    }
  }

  /**
   * Показ справки
   */
  private static showHelp(): void {
    ConsoleUtil.showSectionHeader('Справка по CLI тестов');
    
    console.log(`
Использование: npm run cli test <команда> [опции]

Команды:
  run [опции]           Запуск тестов
  clean                 Очистка тестовых данных
  setup                 Настройка тестового окружения
  status                Показ статуса тестовой системы
  help                  Показ этой справки

Опции для run:
  --verbose, -v         Подробный вывод
  --file, -f <файл>     Запуск конкретного файла
  --pattern, -p <шаблон> Запуск тестов по шаблону имени
  --bail, -b            Остановка при первой ошибке
  --silent, -s          Тихий режим

Примеры:
  npm run cli test run --verbose
  npm run cli test run --file auth.test.ts
  npm run cli test clean
  npm run cli test status
    `);
  }
}

// Точка входа для CLI
async function main(): Promise<void> {
  try {
    // Убеждаемся что мы в тестовой среде
    process.env.NODE_ENV = 'test';
    
    const args = process.argv.slice(2);
    await TestCLI.run(args);
  } catch (error) {
    console.error('❌ Критическая ошибка Test CLI:', error);
    process.exit(1);
  }
}

// Запускаем CLI только если это главный модуль
if (require.main === module) {
  main();
} 