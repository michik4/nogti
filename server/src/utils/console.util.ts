import { FormatUtil } from './format.util';
import { getConfig } from '../conf/global.conf';

/**
 * Утилита для отображения сообщений и статистики в консоли
 */
export class ConsoleUtil {
    /**
     * Отображает статистику выполнения сидов
     */
    static showSeedsStatistics(executed: number, total: number): void {

        const config = getConfig();

        if (config.SERVER.NODE_ENV === 'development') {
            const percentage = FormatUtil.formatPercentage(executed, total);
            console.log(`\n📈 Статистика: ${executed}/${total} сидов выполнено (${percentage})`);

            if (executed === total && total > 0) {
                console.log('🎉 Все сиды выполнены!');
            } else if (executed === 0) {
                console.log('⚠️  Ни один сид не выполнен');
            }
        }
    }

    /**
     * Отображает общую статистику выполнения
     */
    static showStatistics(executed: number, total: number, itemName: string = 'элементов'): void {
        const config = getConfig();

        if (config.SERVER.NODE_ENV === 'development') {
            const stats = FormatUtil.formatExecutionStats(executed, total);
            console.log(`\n📈 Статистика: ${stats} ${itemName} выполнено`);
        }
    }

    /**
     * Отображает сообщение об успехе
     */
    static showSuccess(message: string): void {
        const config = getConfig();

        if (config.SERVER.NODE_ENV === 'development') {
            console.log(`✅ ${message}`);
        }
    }

    /**
     * Отображает сообщение об ошибке
     */
    static showError(message: string, error?: any): void {
        const config = getConfig();

        if (config.SERVER.NODE_ENV === 'development') {
            console.error(`❌ ${message}`);
            if (error) {
                console.error(error);
            }
        }
    }

    /**
     * Отображает информационное сообщение
     */
    static showInfo(message: string, showIcon: boolean = true): void {
        const config = getConfig();
        const icon = showIcon ? '📑' : '';

        if (config.SERVER.NODE_ENV === 'development') {
            console.log(`${icon} ${message}`);
        }
    }

    /**
     * Отображает предупреждение
     */
    static showWarning(message: string, showIcon: boolean = true): void {
        const config = getConfig();
        const icon = showIcon ? '⚠️' : '';

        if (config.SERVER.NODE_ENV === 'development') {
            console.log(`${icon} ${message}`);
        }
    }

    /**
     * Отображает сообщение о процессе
     */
    static showProcess(message: string, showIcon: boolean = true): void {
        const config = getConfig();
        const icon = showIcon ? '🔄' : '';

        if (config.SERVER.NODE_ENV === 'development') {
            console.log(`${icon} ${message}`);
        }
    }

    /**
     * Отображает заголовок секции
     */
    static showSectionHeader(title: string, showIcon: boolean = true): void {
        const config = getConfig();
        const icon = showIcon ? '📊' : '';

        if (config.SERVER.NODE_ENV === 'development') {
            console.log(`\n${icon} ${title}:\n`);
        }
    }

    /**
     * Отображает разделитель
     */
    static showSeparator(): void {
        const config = getConfig();

        if (config.SERVER.NODE_ENV === 'development') {
            console.log('─'.repeat(50));
        }
    }

    /**
     * Отображает ключ-значение
     */
    static showKeyValue(key: string, value: string): void {
        const config = getConfig();

        if (config.SERVER.NODE_ENV === 'development') {
            console.log(`${key}: ${value}`);
        }
    }
} 