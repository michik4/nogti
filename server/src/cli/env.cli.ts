#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { ConsoleUtil } from '../utils/console.util';

/**
 * CLI утилита для работы с переменными окружения в .env файле
 */
class EnvCLI {
    private envPath: string;
    private unsafeMode: boolean;

    constructor() {
        this.envPath = path.join(process.cwd(), '.env');
        // Проверяем наличие флага --unsafe в аргументах (поддерживаем разные варианты)
        this.unsafeMode = process.argv.includes('--unsafe') || 
                         process.argv.includes('unsafe') ||
                         process.argv.includes('-u');
    }

    /**
     * Выполнение команд
     */
    async run(): Promise<void> {
        const command = process.argv[2];
        const key = process.argv[3];
        const value = process.argv[4];

        try {
            switch (command) {
                case 'create':
                    await this.createEnvFile();
                    break;

                case 'get':
                    if (!key) {
                        console.error('❌ Укажите ключ: npm run env get <KEY>');
                        process.exit(1);
                    }
                    this.getVariable(key);
                    break;

                case 'set':
                    if (!key || !value) {
                        console.error('❌ Укажите ключ и значение: npm run env set <KEY> <VALUE>');
                        process.exit(1);
                    }
                    await this.setVariable(key, value);
                    break;

                case 'delete':
                case 'del':
                    if (!key) {
                        console.error('❌ Укажите ключ: npm run env delete <KEY>');
                        process.exit(1);
                    }
                    await this.deleteVariable(key);
                    break;

                case 'list':
                case 'ls':
                case 'show':
                    this.listVariables();
                    break;

                case 'backup':
                    await this.backupEnvFile();
                    break;

                case 'restore':
                    if (!key) {
                        console.error('❌ Укажите файл резервной копии: npm run env restore <filename>');
                        process.exit(1);
                    }
                    await this.restoreEnvFile(key);
                    break;

                case 'validate':
                    this.validateEnvFile();
                    break;

                case 'template':
                    await this.createTemplate();
                    break;

                case 'copy':
                    if (!key) {
                        console.error('❌ Укажите путь к файлу-источнику: npm run env copy <source>');
                        process.exit(1);
                    }
                    await this.copyEnvFile(key);
                    break;

                case 'edit':
                    await this.interactiveEdit();
                    break;

                case 'help':
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            console.error('❌ Ошибка выполнения команды:', error);
            process.exit(1);
        }
    }

    /**
     * Создание .env файла
     */
    private async createEnvFile(): Promise<void> {
        if (fs.existsSync(this.envPath)) {
            ConsoleUtil.showWarning('Файл .env уже существует');
            const overwrite = await this.askQuestion('Перезаписать? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                ConsoleUtil.showInfo('Операция отменена');
                return;
            }
        }

        const defaultContent = `# Настройки сервера
PORT=3000
NODE_ENV=development
HOST=localhost

# Настройки базы данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_DATABASE=prometai_dev

# Настройки логирования
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
ENABLE_RESPONSE_LOGGING=true

# JWT секрет
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS настройки
CORS_ORIGIN=http://localhost:3000
`;

        fs.writeFileSync(this.envPath, defaultContent);
        ConsoleUtil.showSuccess('Файл .env успешно создан');
    }

    /**
     * Получение значения переменной
     */
    private getVariable(key: string): void {
        if (!fs.existsSync(this.envPath)) {
            console.error('❌ Файл .env не найден');
            return;
        }

        const envContent = fs.readFileSync(this.envPath, 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            if (line.trim().startsWith(key + '=')) {
                const value = line.split('=').slice(1).join('=');
                const displayValue = this.maskSensitiveValue(key, value);
                console.log(`${key}=${displayValue}`);
                return;
            }
        }

        ConsoleUtil.showError(`Переменная ${key} не найдена`);
    }

    /**
     * Установка значения переменной
     */
    private async setVariable(key: string, value: string): Promise<void> {
        if (!fs.existsSync(this.envPath)) {
            ConsoleUtil.showInfo('Файл .env не найден, создаем новый...');
            await this.createEnvFile();
        }

        let envContent = fs.readFileSync(this.envPath, 'utf8');
        const lines = envContent.split('\n');
        let keyFound = false;

        // Ищем существующий ключ
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith(key + '=')) {
                lines[i] = `${key}=${value}`;
                keyFound = true;
                ConsoleUtil.showSuccess(`Переменная ${key} обновлена`);
                break;
            }
        }

        // Если ключ не найден, добавляем в конец
        if (!keyFound) {
            if (lines[lines.length - 1] !== '') {
                lines.push('');
            }
            lines.push(`${key}=${value}`);
            ConsoleUtil.showSuccess(`Переменная ${key} добавлена`);
        }

        fs.writeFileSync(this.envPath, lines.join('\n'));
    }

    /**
     * Удаление переменной
     */
    private async deleteVariable(key: string): Promise<void> {
        if (!fs.existsSync(this.envPath)) {
            console.error('❌ Файл .env не найден');
            return;
        }

        const envContent = fs.readFileSync(this.envPath, 'utf8');
        const lines = envContent.split('\n');
        let keyFound = false;

        const filteredLines = lines.filter(line => {
            if (line.trim().startsWith(key + '=')) {
                keyFound = true;
                return false;
            }
            return true;
        });

        if (keyFound) {
            fs.writeFileSync(this.envPath, filteredLines.join('\n'));
            ConsoleUtil.showSuccess(`Переменная ${key} удалена`);
        } else {
            ConsoleUtil.showError(`Переменная ${key} не найдена`);
        }
    }

    /**
     * Список всех переменных
     */
    private listVariables(): void {
        if (!fs.existsSync(this.envPath)) {
            console.error('❌ Файл .env не найден');
            return;
        }

        const envContent = fs.readFileSync(this.envPath, 'utf8');
        const lines = envContent.split('\n');
        
        ConsoleUtil.showSectionHeader('Переменные окружения');
        ConsoleUtil.showSeparator();

        for (const line of lines) {
            if (line.trim() && !line.trim().startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=');
                let displayValue = this.maskSensitiveValue(key, value);
                
                // Обрезаем длинные значения
                displayValue = displayValue.length > 50 ? displayValue.substring(0, 47) + '...' : displayValue;
                
                // Добавляем индикатор если значение замаскировано
                const isMasked = !this.unsafeMode && this.isSensitiveVariable(key) && value.length > 0;
                const maskedIndicator = isMasked ? ' 🔒' : '';
                
                console.log(`${key.padEnd(25)} = ${displayValue}${maskedIndicator}`);
            } else if (line.trim().startsWith('#')) {
                console.log(`\n💬 ${line.trim()}`);
            }
        }
        
        // Показываем информацию о режиме безопасности
        if (!this.unsafeMode) {
            console.log(`\n🔒 Чувствительные данные скрыты. Используйте 'unsafe' флаг для отображения.`);
            console.log(`   Пример: npm run env list unsafe`);
        } else {
            console.log(`\n⚠️  Режим unsafe: отображаются все данные включая пароли!`);
        }
    }

    /**
     * Создание резервной копии
     */
    private async backupEnvFile(): Promise<void> {
        if (!fs.existsSync(this.envPath)) {
            console.error('❌ Файл .env не найден');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(process.cwd(), `.env.backup.${timestamp}`);

        fs.copyFileSync(this.envPath, backupPath);
        ConsoleUtil.showSuccess(`Резервная копия создана: ${path.basename(backupPath)}`);
    }

    /**
     * Восстановление из резервной копии
     */
    private async restoreEnvFile(backupFile: string): Promise<void> {
        const backupPath = path.join(process.cwd(), backupFile);

        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Файл резервной копии ${backupFile} не найден`);
            return;
        }

        if (fs.existsSync(this.envPath)) {
            const overwrite = await this.askQuestion('Перезаписать текущий .env файл? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('❌ Операция отменена');
                return;
            }
        }

        fs.copyFileSync(backupPath, this.envPath);
        ConsoleUtil.showSuccess(`Файл .env восстановлен из ${backupFile}`);
    }

    /**
     * Валидация .env файла
     */
    private validateEnvFile(): void {
        if (!fs.existsSync(this.envPath)) {
            console.error('❌ Файл .env не найден');
            return;
        }

        const envContent = fs.readFileSync(this.envPath, 'utf8');
        const lines = envContent.split('\n');
        const issues: string[] = [];
        const duplicates: string[] = [];
        const keys = new Set<string>();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                
                if (!key) {
                    issues.push(`Строка ${i + 1}: Пустой ключ`);
                } else if (keys.has(key)) {
                    duplicates.push(key);
                } else {
                    keys.add(key);
                }

                if (valueParts.length === 0) {
                    issues.push(`Строка ${i + 1}: Отсутствует значение для ${key}`);
                }
            }
        }

        ConsoleUtil.showSectionHeader('Результаты валидации .env файла');

        if (issues.length === 0 && duplicates.length === 0) {
            ConsoleUtil.showSuccess('Файл .env корректен');
        } else {
            if (issues.length > 0) {
                ConsoleUtil.showError('Найдены проблемы:');
                issues.forEach(issue => console.log(`  • ${issue}`));
            }

            if (duplicates.length > 0) {
                ConsoleUtil.showWarning('Найдены дубликаты:');
                duplicates.forEach(dup => console.log(`  • ${dup}`));
            }
        }

        console.log(`\n📊 Статистика: ${keys.size} уникальных переменных`);
    }

    /**
     * Создание шаблона .env файла
     */
    private async createTemplate(): Promise<void> {
        const templatePath = path.join(process.cwd(), '.env.template');

        if (fs.existsSync(templatePath)) {
            const overwrite = await this.askQuestion('Шаблон .env.template уже существует. Перезаписать? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('❌ Операция отменена');
                return;
            }
        }

        let templateContent = '';

        if (fs.existsSync(this.envPath)) {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            const lines = envContent.split('\n');

            for (const line of lines) {
                if (line.trim().startsWith('#') || line.trim() === '') {
                    templateContent += line + '\n';
                } else if (line.includes('=')) {
                    const [key] = line.split('=');
                    templateContent += `${key}=\n`;
                }
            }
        } else {
            templateContent = `# Настройки сервера
PORT=
NODE_ENV=
HOST=

# Настройки базы данных
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

# Настройки логирования
LOG_LEVEL=
ENABLE_REQUEST_LOGGING=
ENABLE_RESPONSE_LOGGING=

# JWT секрет
JWT_SECRET=

# CORS настройки
CORS_ORIGIN=
`;
        }

        fs.writeFileSync(templatePath, templateContent);
        ConsoleUtil.showSuccess('Шаблон .env.template создан');
    }

    /**
     * Копирование .env файла
     */
    private async copyEnvFile(sourcePath: string): Promise<void> {
        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Файл-источник ${sourcePath} не найден`);
            return;
        }

        if (fs.existsSync(this.envPath)) {
            const overwrite = await this.askQuestion('Файл .env уже существует. Перезаписать? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('❌ Операция отменена');
                return;
            }
        }

        fs.copyFileSync(sourcePath, this.envPath);
        ConsoleUtil.showSuccess(`Файл .env скопирован из ${sourcePath}`);
    }

    /**
     * Интерактивное редактирование
     */
    private async interactiveEdit(): Promise<void> {
        if (!fs.existsSync(this.envPath)) {
            ConsoleUtil.showInfo('Файл .env не найден, создаем новый...');
            await this.createEnvFile();
        }

        ConsoleUtil.showSectionHeader('Интерактивное редактирование .env файла');
        ConsoleUtil.showInfo('Введите "exit" для завершения');

        while (true) {
            const action = await this.askQuestion('Действие (get/set/delete/list/exit): ');

            switch (action.toLowerCase()) {
                case 'get':
                    const getKey = await this.askQuestion('Ключ: ');
                    this.getVariable(getKey);
                    break;

                case 'set':
                    const setKey = await this.askQuestion('Ключ: ');
                    const setValue = await this.askQuestion('Значение: ');
                    await this.setVariable(setKey, setValue);
                    break;

                case 'delete':
                case 'del':
                    const delKey = await this.askQuestion('Ключ для удаления: ');
                    await this.deleteVariable(delKey);
                    break;

                case 'list':
                case 'ls':
                    this.listVariables();
                    break;

                case 'exit':
                    ConsoleUtil.showInfo('Завершение работы');
                    return;

                default:
                    ConsoleUtil.showError('Неизвестная команда');
            }

            console.log(); // Пустая строка для разделения
        }
    }

    /**
     * Проверяет, является ли переменная чувствительной
     */
    private isSensitiveVariable(key: string): boolean {
        const sensitiveKeys = [
            'PASSWORD', 'PASS', 'PWD', 'SECRET', 'TOKEN', 'KEY', 'PRIVATE',
            'API_KEY', 'AUTH_KEY', 'JWT_SECRET', 'DB_PASSWORD', 'DATABASE_PASSWORD',
            'SMTP_PASSWORD', 'EMAIL_PASSWORD', 'REDIS_PASSWORD', 'SESSION_SECRET',
            'ENCRYPTION_KEY', 'PRIVATE_KEY', 'CLIENT_SECRET', 'ACCESS_TOKEN',
            'REFRESH_TOKEN', 'WEBHOOK_SECRET', 'SIGNING_KEY'
        ];
        
        const upperKey = key.toUpperCase();
        return sensitiveKeys.some(sensitive => upperKey.includes(sensitive));
    }

    /**
     * Маскирует чувствительные данные если не включен unsafe режим
     */
    private maskSensitiveValue(key: string, value: string): string {
        if (this.unsafeMode || !this.isSensitiveVariable(key)) {
            return value;
        }
        
        if (!value || value.length === 0) {
            return value;
        }
        
        // Для коротких значений показываем только звездочки
        if (value.length <= 3) {
            return '***';
        }
        
        // Показываем первый и последний символ, между ними всегда 3 звездочки
        const firstChar = value.charAt(0);
        const lastChar = value.charAt(value.length - 1);
        
        return `${firstChar}***${lastChar}`;
    }

    /**
     * Вспомогательная функция для ввода пользователя
     */
    private askQuestion(question: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    /**
     * Показать справку
     */
    private showHelp(): void {
        console.log(`
🔧 Утилита управления переменными окружения (.env)

Использование: npm run env <command> [options]

Основные команды:
  create                    Создать новый .env файл с шаблоном
  get <KEY>                 Получить значение переменной
  set <KEY> <VALUE>         Установить значение переменной
  delete <KEY>              Удалить переменную
  list                      Показать все переменные

Управление файлами:
  backup                    Создать резервную копию .env
  restore <filename>        Восстановить из резервной копии
  copy <source>             Скопировать .env из другого файла
  template                  Создать шаблон .env.template

Утилиты:
  validate                  Проверить корректность .env файла
  edit                      Интерактивное редактирование
  help                      Показать эту справку

Флаги безопасности:
  unsafe, -u, --unsafe     Показать чувствительные данные (пароли, токены)
                           ⚠️  ВНИМАНИЕ: Используйте только в безопасной среде!

Примеры:
  npm run env create
  npm run env set PORT 3000
  npm run env get NODE_ENV
  npm run env delete OLD_VAR
  npm run env list
  npm run env list unsafe             # Показать все данные включая пароли
  npm run env show unsafe             # То же что и list unsafe
  npm run env get JWT_SECRET unsafe   # Показать скрытое значение
  npm run cli env list -- --unsafe   # Альтернативный синтаксис через cli runner
  npm run env backup
  npm run env validate

Алиасы:
  del = delete
  ls = list
  show = list

🔒 По умолчанию чувствительные данные (пароли, токены, секреты) скрыты для безопасности.
Чувствительные переменные отмечены значком 🔒 при отображении.
        `);
    }
}

// Запуск CLI
const cli = new EnvCLI();
cli.run().catch(console.error); 