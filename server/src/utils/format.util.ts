/**
 * Утилита для форматирования различных типов данных
 */
export class FormatUtil {
  /**
   * Форматирует статус сида с эмодзи
   */
  static formatSeedStatus(isExecuted: boolean): string {
    return isExecuted ? '✅ Выполнен' : '⏳ Ожидает';
  }

  /**
   * Форматирует дату в читаемый формат
   */
  static formatDate(date: string | Date): string {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Форматирует размер файла в читаемый формат
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Форматирует процентное соотношение
   */
  static formatPercentage(current: number, total: number): string {
    if (total === 0) return '0%';
    return Math.round((current / total) * 100) + '%';
  }

  /**
   * Форматирует продолжительность в миллисекундах
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Форматирует статистику выполнения
   */
  static formatExecutionStats(executed: number, total: number): string {
    const percentage = this.formatPercentage(executed, total);
    return `${executed}/${total} (${percentage})`;
  }

  /**
   * Обрезает текст до указанной длины с добавлением многоточия
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Добавляет отступы к тексту
   */
  static padText(text: string, length: number, align: 'left' | 'right' | 'center' = 'left'): string {
    if (text.length >= length) return text;
    
    const padding = length - text.length;
    
    switch (align) {
      case 'right':
        return ' '.repeat(padding) + text;
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
      default:
        return text + ' '.repeat(padding);
    }
  }

  /**
   * Форматирует текст успеха (зеленый)
   */
  static formatSuccess(text: string): string {
    return `\x1b[32m${text}\x1b[0m`; // Зеленый цвет
  }

  /**
   * Форматирует текст ошибки (красный)
   */
  static formatError(text: string): string {
    return `\x1b[31m${text}\x1b[0m`; // Красный цвет
  }

  /**
   * Форматирует текст предупреждения (желтый)
   */
  static formatWarning(text: string): string {
    return `\x1b[33m${text}\x1b[0m`; // Желтый цвет
  }
} 