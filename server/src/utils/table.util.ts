import Table from 'cli-table3';

/**
 * Утилита для создания красивых таблиц в консоли
 */
export class TableUtil {
  /**
   * Создает таблицу для отображения статуса сидов
   */
  static createSeedsStatusTable(): Table.Table {
    return new Table({
      head: ['Название сида', 'Статус', 'Дата выполнения'],
      colWidths: [35, 15, 22],
      style: {
        head: ['cyan', 'bold'],
        border: ['grey']
      },
      chars: {
        'top': '═',
        'top-mid': '╤',
        'top-left': '╔',
        'top-right': '╗',
        'bottom': '═',
        'bottom-mid': '╧',
        'bottom-left': '╚',
        'bottom-right': '╝',
        'left': '║',
        'left-mid': '╟',
        'mid': '─',
        'mid-mid': '┼',
        'right': '║',
        'right-mid': '╢',
        'middle': '│'
      }
    });
  }

  /**
   * Создает общую таблицу с настраиваемыми заголовками и шириной колонок
   */
  static createTable(headers: string[], colWidths?: number[]): Table.Table {
    const config: any = {
      head: headers,
      style: {
        head: ['cyan', 'bold'],
        border: ['grey']
      },
      chars: {
        'top': '═',
        'top-mid': '╤',
        'top-left': '╔',
        'top-right': '╗',
        'bottom': '═',
        'bottom-mid': '╧',
        'bottom-left': '╚',
        'bottom-right': '╝',
        'left': '║',
        'left-mid': '╟',
        'mid': '─',
        'mid-mid': '┼',
        'right': '║',
        'right-mid': '╢',
        'middle': '│'
      }
    };

    if (colWidths) {
      config.colWidths = colWidths;
    }

    return new Table(config);
  }

  /**
   * Создает таблицу для тестовых файлов
   */
  static createTestFilesTable(): Table.Table {
    return new Table({
      head: ['Название', 'Путь', 'Статус'],
      colWidths: [20, 50, 15],
      style: {
        head: ['cyan', 'bold'],
        border: ['grey']
      }
    });
  }

  /**
   * Создает таблицу сводки тестов
   */
  static createTestSummaryTable(): Table.Table {
    return new Table({
      head: ['Тестовый набор', 'Всего', 'Пройдено', 'Провалено', 'Пропущено', 'Успех %', 'Время'],
      colWidths: [25, 8, 10, 10, 10, 10, 12],
      style: {
        head: ['cyan', 'bold'],
        border: ['grey']
      }
    });
  }

  /**
   * Создает таблицу покрытия кода
   */
  static createCoverageTable(): Table.Table {
    return new Table({
      head: ['Файл', 'Строки %', 'Функции %', 'Ветки %', 'Операторы %'],
      colWidths: [40, 12, 12, 12, 15],
      style: {
        head: ['cyan', 'bold'],
        border: ['grey']
      }
    });
  }

  /**
   * Печатает таблицу из массива объектов
   * @param data - массив объектов для отображения
   * @param colWidths - ширина колонок (опционально)
   */
  static printTable(data: any[], colWidths?: number[]): void {
    if (!data || data.length === 0) {
      console.log('Нет данных для отображения');
      return;
    }

    // Получаем заголовки из первого объекта
    const headers = Object.keys(data[0]);
    
    // Создаем таблицу
    const table = this.createTable(headers, colWidths);
    
    // Добавляем строки
    data.forEach(item => {
      const row = headers.map(header => item[header] ?? '');
      table.push(row);
    });

    // Печатаем таблицу
    console.log(table.toString());
  }
} 