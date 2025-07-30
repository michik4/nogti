#!/usr/bin/env node


import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { ConsoleUtil } from '../utils/console.util';
import { RatingCli } from './rating.cli';

/**
 * Универсальная CLI обертка
 * Автоматически выбирает между ts-node и скомпилированными файлами
 */
class CLIRunner {
    private cliName: string;
    private args: string[];

    constructor() {
        // Получаем имя CLI из аргументов командной строки
        this.cliName = process.argv[2]; // env, db, etc.
        this.args = process.argv.slice(3);
    }

    /**
     * Запуск CLI
     */
    async run(): Promise<void> {
        if (!this.cliName || this.cliName === 'help') {
            CLIRunner.showHelp();
            return;
        }

        if (this.cliName === 'version' || this.cliName === '--version' || this.cliName === '-v') {
            CLIRunner.showVersion();
            return;
        }

        if (this.cliName === 'list') {
            CLIRunner.showAvailableCLIs();
            return;
        }

        // Специальная обработка для команды rating
        if (this.cliName === 'rating') {
            await this.handleRatingCommand();
            return;
        }

        const cliPath = await this.getCLIPath();
        if (!cliPath) {
            ConsoleUtil.showError(`CLI "${this.cliName}" не найден`);
            console.log('');
            CLIRunner.showAvailableCLIs();
            process.exit(1);
        }

        await this.executeCLI(cliPath);
    }

    /**
     * Обрабатывает команды для работы с рейтингами
     */
    private async handleRatingCommand(): Promise<void> {
        // Инициализируем соединение с БД для команд рейтингов
        await import('../conf/orm.conf').then(async (module) => {
            await module.AppDataSource.initialize();
        });

        const subCommand = this.args[0];
        const commandArgs = this.args.slice(1);

        try {
            switch (subCommand) {
                case 'recalculate':
                case 'recalc':
                    await RatingCli.recalculateAllRatings();
                    break;
                case 'stats':
                    if (commandArgs.length === 0) {
                        await RatingCli.showOverallStats();
                    } else {
                        const masterId = commandArgs[0];
                        await RatingCli.showMasterRatingStats(masterId);
                    }
                    break;
                case 'review':
                    if (commandArgs.length === 0) {
                        console.log('❌ Необходимо указать ID отзыва');
                        console.log('Пример: npm run cli rating review <review-id>');
                    } else {
                        const reviewId = commandArgs[0];
                        await RatingCli.showReviewDetails(reviewId);
                    }
                    break;
                case 'diagnose':
                    if (commandArgs.length === 0) {
                        console.log('❌ Необходимо указать ID пользователя');
                        console.log('Пример: npm run cli rating diagnose <user-id> [review-id]');
                    } else {
                        const userId = commandArgs[0];
                        const reviewId = commandArgs[1]; // опционально
                        await RatingCli.diagnosеOwnership(userId, reviewId);
                    }
                    break;
                case 'help':
                case '--help':
                case '-h':
                default:
                    this.showRatingHelp();
                    break;
            }
        } catch (error) {
            console.error('❌ Ошибка выполнения команды рейтингов:', error);
            process.exit(1);
        }
    }

    /**
     * Показывает справку по командам рейтингов
     */
    private showRatingHelp(): void {
        console.log(`
🌟 Команды для работы с рейтингами:

📊 Общие команды:
  rating stats                    - Общая статистика рейтингов системы
  rating stats <master-id>        - Детальная статистика рейтингов мастера
  rating recalculate             - Пересчитать рейтинги для всех мастеров
  rating review <review-id>       - Показать детали конкретного отзыва
  rating diagnose <user-id> [review-id] - Диагностика проблем с авторством отзывов

💡 Примеры использования:
  npm run cli rating stats                           # Общая статистика
  npm run cli rating stats 123e4567-e89b-12d3-a456  # Статистика мастера
  npm run cli rating recalc                          # Пересчет всех рейтингов
  npm run cli rating review 987fcdeb-51a2-43f6-b789 # Детали отзыва
  npm run cli rating diagnose 123e4567-e89b-12d3     # Проверка авторства для пользователя
  npm run cli rating diagnose user-id review-id      # Проверка конкретного отзыва

🔍 Диагностика:
  Команда diagnose помогает выявить проблемы с правами доступа к отзывам.
  Показывает типы данных, ID пользователей и авторство отзывов.

📚 Дополнительная информация:
  - Рейтинг автоматически пересчитывается при добавлении/изменении/удалении отзыва
  - Команда recalculate полезна для исправления несоответствий
  - Минимум 3 отзыва требуется для попадания в топ-рейтинг
  - Клиенты могут редактировать и удалять только свои отзывы
  - При ошибках 403 используйте команду diagnose для выяснения причин
        `);
    }

    /**
     * Получение пути к CLI файлу
     */
    private async getCLIPath(): Promise<string | null> {
        const tsPath = path.join(__dirname, `${this.cliName}.cli.ts`);
        const jsPath = path.join(__dirname, `${this.cliName}.cli.js`);
        const distPath = path.join(process.cwd(), 'dist', 'cli', `${this.cliName}.cli.js`);

        // Сначала проверяем скомпилированную версию в dist
        if (fs.existsSync(distPath)) {
            return distPath;
        }

        // Затем проверяем JS версию в текущей директории
        if (fs.existsSync(jsPath)) {
            return jsPath;
        }

        // В последнюю очередь TS версию (для разработки)
        if (fs.existsSync(tsPath)) {
            return tsPath;
        }

        return null;
    }

    /**
     * Выполнение CLI
     */
    private async executeCLI(cliPath: string): Promise<void> {
        const isTypeScript = cliPath.endsWith('.ts');
        
        let command: string;
        let commandArgs: string[];

        if (isTypeScript) {
            // Для TS файлов используем ts-node
            command = 'npx';
            commandArgs = ['ts-node', '--transpile-only', cliPath, ...this.args];
        } else {
            // Для JS файлов используем node
            command = 'node';
            commandArgs = [cliPath, ...this.args];
        }

        // Запускаем процесс
        const childProcess = spawn(command, commandArgs, {
            stdio: 'inherit',
            shell: process.platform === 'win32'
        });

        // Обрабатываем завершение процесса
        childProcess.on('exit', (code) => {
            process.exit(code || 0);
        });

        // Обрабатываем ошибки
        childProcess.on('error', (error) => {
            console.error('❌ Ошибка запуска CLI:', error.message);
            process.exit(1);
        });
    }

    /**
     * Показать общую справку
     */
    static showHelp(): void {
        console.log(`
🛠️  Prometai Server CLI Tools

Использование: npm run cli <command> [options]

Доступные команды:
  env                       Управление переменными окружения (.env)
  db                        Управление базой данных
  test                      Управление тестами
  rating                    Управление рейтингами

Основные примеры:
  npm run cli env help      Справка по env CLI
  npm run cli env list      Показать все переменные окружения
  npm run cli env get PORT  Получить значение переменной
  npm run cli env set PORT 3000  Установить переменную
  
  npm run cli db help       Справка по database CLI
  npm run cli db migration:status  Статус миграций
  npm run cli db migration:run     Выполнить миграции
  
  npm run cli test help     Справка по test CLI
  npm run cli test run      Запуск всех тестов
  npm run cli test coverage Анализ покрытия кода
  npm run cli rating help  Справка по рейтингам
  npm run cli rating recalc  Пересчитать все рейтинги
  npm run cli rating stats  Общая статистика рейтингов
  npm run cli rating stats <master-id>  Детальная статистика мастера
  npm run cli rating review <review-id>  Детали конкретного отзыва

Быстрые команды (без npm wrapper):
  npm run -s env:get PORT   Получить переменную (чистый вывод)
  npm run -s env:list       Список всех переменных
  npm run -s env:validate   Проверить .env файл

Для подробной справки по конкретному CLI:
  npm run cli <command> help

Примеры команд:
  npm run cli env create            # Создать .env файл
  npm run cli env backup            # Резервная копия .env
  npm run cli db migration:generate CreateUsers  # Создать миграцию
  npm run cli rating recalc        # Пересчитать все рейтинги
        `);
    }

    /**
     * Показать версию CLI
     */
    static showVersion(): void {
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            console.log(`🛠️  Prometai Server CLI Tools v${packageJson.version}`);
            console.log(`📦 Package: ${packageJson.name}`);
            console.log(`📝 Description: ${packageJson.description}`);
            console.log(`🔧 Node.js: ${process.version}`);
            console.log(`💻 Platform: ${process.platform} ${process.arch}`);
        } catch (error) {
            console.log('🛠️  Prometai Server CLI Tools');
            console.log('❌ Не удалось получить информацию о версии');
        }
    }

    /**
     * Показать доступные CLI
     */
    static showAvailableCLIs(): void {
        console.log('📋 Доступные CLI инструменты:');
        console.log('  env  - Управление переменными окружения');
        console.log('  db   - Управление базой данных');
        console.log('  test - Управление тестами');
        console.log('  rating - Управление рейтингами');
        console.log('');
        console.log('Использование: npm run cli <cli-name> [args]');
        console.log('Пример: npm run cli env get PORT');
    }
}

// Запуск
const runner = new CLIRunner();
runner.run().catch(console.error); 
