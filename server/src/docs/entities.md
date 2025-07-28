# Документация по сущностям платформы каталога маникюра

## Обзор архитектуры

Платформа построена на основе TypeORM с использованием наследования сущностей (Table Inheritance) для пользователей и связанных таблиц для реализации бизнес-логики согласно ТЗ.

## Базовые сущности пользователей

### UserEntity (users)
Базовая сущность для всех типов пользователей с использованием Table Inheritance.

**Поля:**
- `id` - UUID, первичный ключ
- `email` - Уникальный email
- `username` - Уникальное имя пользователя
- `password` - Хешированный пароль
- `role` - Роль пользователя (admin, nailmaster, client)
- `isGuest` - Флаг временного пользователя (для автоматической регистрации)
- `avatar_url` - URL аватара
- `createdAt/updatedAt` - Временные метки

### AdminEntity (users)
Наследует UserEntity. Администратор системы.

**Дополнительные поля:**
- `fullName` - Полное имя
- `phone` - Уникальный номер телефона
- `permissions` - JSON массив разрешений
- `isActive` - Статус активности

### ClientEntity (users)
Наследует UserEntity. Клиент платформы.

**Дополнительные поля:**
- `fullName` - Полное имя (опционально)
- `phone` - Номер телефона (опционально, заполняется при записи)
- `latitude/longitude` - Координаты для поиска ближайших мастеров

**Связи:**
- `likedNailDesigns` - Избранные дизайны (Many-to-Many)
- `orders` - Заказы клиента (One-to-Many)
- `reviews` - Отзывы клиента (One-to-Many)
- `uploadedDesigns` - Загруженные дизайны (One-to-Many)

### NailMasterEntity (users)
Наследует UserEntity. Мастер маникюра.

**Дополнительные поля:**
- `fullName` - Полное имя (обязательно)
- `phone` - Уникальный номер телефона
- `address` - Адрес работы
- `description` - Описание мастера
- `rating` - Рейтинг (по умолчанию 100)
- `totalOrders` - Общее количество заказов
- `isActive` - Статус активности
- `latitude/longitude` - Координаты для поиска

**Связи:**
- `orders` - Заказы мастера (One-to-Many)
- `canDoDesigns` - Дизайны, которые может выполнить (One-to-Many через MasterDesignEntity)
- `schedules` - Расписание работы (One-to-Many)

## Основные бизнес-сущности

### NailDesignEntity (nail_designs)
Дизайны маникюра в каталоге.

**Поля:**
- `id` - UUID, первичный ключ
- `title` - Название дизайна
- `description` - Описание
- `imageUrl` - URL изображения (обязательно)
- `videoUrl` - URL видео (опционально)
- `type` - Тип дизайна (basic/designer)
- `source` - Источник (admin/client/master)
- `tags` - JSON массив тегов
- `color` - Основной цвет
- `estimatedPrice` - Примерная стоимость
- `likesCount` - Количество лайков
- `ordersCount` - Количество заказов
- `isActive` - Активность
- `isModerated` - Прошел ли модерацию

**Связи:**
- `likedByClients` - Клиенты, лайкнувшие дизайн (Many-to-Many)
- `canDoMasters` - Мастера, которые могут выполнить (One-to-Many через MasterDesignEntity)
- `uploadedByClient` - Клиент, загрузивший дизайн
- `uploadedByAdmin` - Администратор, загрузивший дизайн
- `orders` - Заказы на этот дизайн (One-to-Many)
- `reviews` - Отзывы на дизайн (One-to-Many)

### OrderEntity (orders)
Заказы/записи на маникюр.

**Поля:**
- `id` - UUID, первичный ключ
- `description` - Описание заказа
- `status` - Статус заказа (enum: pending, confirmed, declined, timeout и др.)
- `price` - Финальная стоимость
- `requestedDateTime` - Запрошенное время
- `proposedDateTime` - Предложенное мастером время
- `confirmedDateTime` - Подтвержденное время
- `masterNotes/clientNotes` - Заметки мастера/клиента
- `masterResponseTime` - Время ответа мастера

**Связи:**
- `client` - Клиент (Many-to-One)
- `nailMaster` - Мастер (Many-to-One)
- `nailDesign` - Дизайн (Many-to-One)

### MasterDesignEntity (master_designs)
Промежуточная таблица для связи "Мастер может выполнить дизайн" (реализация функции "Я так могу").

**Поля:**
- `id` - UUID, первичный ключ
- `customPrice` - Индивидуальная цена мастера
- `notes` - Заметки мастера
- `estimatedDuration` - Предполагаемая длительность
- `isActive` - Активность предложения
- `addedAt` - Когда добавлено

**Связи:**
- `nailMaster` - Мастер (Many-to-One)
- `nailDesign` - Дизайн (Many-to-One)

### ScheduleEntity (schedules)
Расписание мастеров.

**Поля:**
- `id` - UUID, первичный ключ
- `workDate` - Рабочая дата
- `startTime/endTime` - Время начала/окончания слота
- `status` - Статус слота (available/booked/blocked)
- `notes` - Заметки

**Связи:**
- `nailMaster` - Мастер (Many-to-One)

### ReviewEntity (reviews)
Отзывы и комментарии.

**Поля:**
- `id` - UUID, первичный ключ
- `comment` - Текст отзыва
- `rating` - Рейтинг 1-5 (опционально)
- `imageUrl` - Фото к отзыву
- `isActive` - Активность

**Связи:**
- `client` - Клиент (Many-to-One)
- `nailDesign` - Дизайн (Many-to-One)
- `nailMaster` - Мастер (Many-to-One, опционально)

### NotificationEntity (notifications)
Система уведомлений.

**Поля:**
- `id` - UUID, первичный ключ
- `type` - Тип уведомления (enum)
- `title` - Заголовок
- `message` - Сообщение
- `isRead` - Прочитано ли
- `isSent` - Отправлено ли SMS/email
- `metadata` - JSON с дополнительными данными

**Связи:**
- `recipient` - Получатель (Many-to-One к UserEntity)
- `relatedOrder` - Связанный заказ (Many-to-One, опционально)

## Ключевые особенности реализации

### 1. Автоматическая регистрация клиентов
- Поле `isGuest` в UserEntity позволяет создавать временных пользователей
- При первой записи на услугу без входа создается аккаунт с указанным телефоном

### 2. Система рейтинга
- Рейтинг мастера хранится в `NailMasterEntity.rating`
- Автоматические штрафы за таймауты реализуются через бизнес-логику

### 3. Функционал "Я так могу"
- Реализован через промежуточную таблицу `MasterDesignEntity`
- Позволяет мастерам устанавливать индивидуальные цены и условия

### 4. Геолокация
- Координаты хранятся в сущностях клиентов и мастеров
- Используются для поиска ближайших мастеров

### 5. Система уведомлений
- Универсальная система для всех типов уведомлений
- Поддержка метаданных для гибкости
- Отслеживание статуса отправки

## Следующие шаги

1. Создание миграций для всех сущностей
2. Настройка связей в ORM конфигурации
3. Реализация контроллеров и сервисов
4. Создание API endpoints согласно ТЗ 