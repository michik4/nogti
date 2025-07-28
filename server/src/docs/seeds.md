# Система сидов (Seeds)

Система сидов предназначена для заполнения базы данных тестовыми или начальными данными.

## Структура сидов

Все сиды располагаются в директории `src/seeds/` и имеют следующую структуру:

```typescript
import { DataSource } from 'typeorm';

export default class ExampleSeed {
  static async run(dataSource: DataSource): Promise<void> {
    // Логика сида
  }
}
```

## Основные принципы

1. **Идемпотентность** - сиды можно запускать несколько раз без дублирования данных
2. **Проверка существования** - перед созданием данных проверяется их наличие
3. **Логирование** - все действия логируются для отслеживания
4. **Обработка ошибок** - ошибки обрабатываются и не прерывают выполнение других сидов

## Управление сидами

### CLI команды

```bash
# Выполнить все сиды
npm run db seed:run

# Выполнить конкретный сид
npm run db seed:run user

# Показать статус сидов
npm run db seed:status

# Сбросить все сиды (удалить записи о выполнении)
npm run db seed:reset
```

### Отслеживание выполнения

Система автоматически создает таблицу `seeds` для отслеживания выполненных сидов:

```sql
CREATE TABLE seeds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Доступные сиды

### user.seed.ts
Создает тестовых пользователей:
- `admin@prometai.com` / `admin` (пароль: admin123)
- `user@prometai.com` / `testuser` (пароль: user123)  
- `demo@prometai.com` / `demo` (пароль: demo123)

**Особенности:**
- Проверяет существование пользователей перед созданием
- Пароли автоматически хешируются через `@BeforeInsert` hook
- Проверяет уникальность email и username

## Создание нового сида

1. Создайте файл в `src/seeds/` с именем `название.seed.ts`
2. Экспортируйте класс по умолчанию со статическим методом `run`
3. Реализуйте логику с проверкой существования данных
4. Добавьте логирование для отслеживания прогресса

### Пример нового сида

```typescript
import { DataSource } from 'typeorm';
import { YourEntity } from '../entities/your.entity';

export default class YourSeed {
  static async run(dataSource: DataSource): Promise<void> {
    console.log('🔧 Создание данных...');
    
    const repository = dataSource.getRepository(YourEntity);
    
    // Проверка существования
    const existing = await repository.count();
    if (existing > 0) {
      console.log('ℹ️ Данные уже существуют, пропускаем');
      return;
    }
    
    // Создание данных
    // ...
    
    console.log('✅ Сид выполнен успешно');
  }
}
```

## Рекомендации

1. **Всегда проверяйте существование данных** перед созданием
2. **Используйте транзакции** для атомарности операций
3. **Логируйте все действия** для отладки
4. **Обрабатывайте ошибки** gracefully
5. **Делайте сиды идемпотентными** - безопасными для повторного запуска 