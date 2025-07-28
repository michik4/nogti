# Система загрузки файлов для дизайнов

## Обзор

Реализована полная система загрузки изображений для дизайнов ногтей с поддержкой drag-and-drop, валидацией файлов и превью в реальном времени.

## Функциональность

### 🖼️ **Возможности системы**

- **Drag-and-drop загрузка** изображений
- **Превью в реальном времени** при выборе файла
- **Автоматическая загрузка** на сервер
- **Валидация файлов** (тип, размер)
- **Адаптивный дизайн** с поддержкой двух режимов:
  - Загрузка файла с компьютера
  - Ввод URL изображения
- **Индикаторы загрузки** и обратная связь

### 📝 **Поддерживаемые форматы**
- JPEG (.jpg, .jpeg)
- PNG (.png)  
- WebP (.webp)
- GIF (.gif)

### 📏 **Ограничения**
- Максимальный размер файла: **10MB**
- Файлы сохраняются в: `server/public/uploads/designs/`

## Серверная часть

### **API Endpoint**

#### **POST /api/designs/upload-image**

Загружает изображение для дизайна.

**Требования:**
- Авторизация: Bearer token
- Роль: client или nailmaster
- Content-Type: multipart/form-data
- Поле файла: `image`

**Запрос:**
```typescript
FormData {
  image: File // Файл изображения
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/designs/design_userId_timestamp.jpg"
  }
}
```

**Ошибки:**
- `400` - Файл не предоставлен или неверный тип/размер
- `401` - Требуется авторизация
- `403` - Недостаточно прав доступа
- `500` - Внутренняя ошибка сервера

### **Контроллер**

```typescript
// server/src/controllers/nail-design.controller.ts
static async uploadDesignImage(req: any, res: Response): Promise<void>
```

**Особенности:**
- Валидация типа файла (JPEG, PNG, WebP, GIF)
- Валидация размера (максимум 10MB)
- Генерация уникального имени файла
- Автоматическое создание директории для загрузок
- Детальное логирование для отладки

### **Маршрут**

```typescript
// server/src/routes/designs.route.ts
router.post('/upload-image', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireRole('client', 'nailmaster'), 
  upload.single('image'), 
  NailDesignController.uploadDesignImage
);
```

### **Конфигурация Multer**

```typescript
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
```

## Клиентская часть

### **Компонент FileUpload**

`client/src/components/ui/file-upload.tsx` - переиспользуемый компонент для загрузки файлов.

**Возможности:**
- Drag-and-drop интерфейс
- Клик для выбора файла
- Превью изображения
- Индикаторы загрузки
- Валидация на клиенте
- Автоматическая очистка URL объектов

**Использование:**
```tsx
<FileUpload
  onFileSelect={handleFileSelect}
  onFileUpload={handleFileUpload}
  previewUrl={imagePreview}
  onPreviewClear={handleClearImage}
  loading={uploadingImage}
  disabled={loading}
  maxSize={10 * 1024 * 1024}
/>
```

### **Сервис загрузки**

```typescript
// client/src/services/designService.ts
uploadDesignImage: async (file: File): Promise<ApiResponse<{ imageUrl: string }>>
```

**Особенности:**
- Клиентская валидация файлов
- Обработка ошибок
- Типизированные ответы

### **Интеграция в AddDesignModal**

Модальное окно создания дизайна поддерживает два режима:

1. **Загрузка файла** - drag-and-drop или выбор с компьютера
2. **Ввод URL** - ручной ввод ссылки на изображение

**Функциональность:**
- Переключение между режимами
- Автоматическая загрузка при выборе файла
- Превью изображения
- Валидация перед отправкой формы
- Автоматическая очистка ресурсов

## Исправления

### **Middleware валидации**

Исправлен middleware `validateRequestBody` для поддержки multipart/form-data:

```typescript
// server/src/middleware/error.middleware.ts
const contentType = req.get('Content-Type') || '';
const isMultipartFormData = contentType.startsWith('multipart/form-data');

if (req.method === 'POST' && req.body === undefined && !isMultipartFormData) {
    // Блокируем только если это не multipart/form-data
}
```

## Безопасность

1. **Валидация типов файлов** на клиенте и сервере
2. **Ограничение размера файлов** (10MB)
3. **Аутентификация и авторизация** пользователей
4. **Уникальные имена файлов** для предотвращения конфликтов
5. **Валидация Content-Type** в middleware

## Производительность

1. **Хранение файлов в памяти** с помощью multer.memoryStorage()
2. **Автоматическая очистка** URL объектов для предотвращения утечек памяти
3. **Индикаторы загрузки** для улучшения UX
4. **Валидация на клиенте** для снижения нагрузки на сервер

## Использование

1. Откройте дашборд мастера
2. Нажмите "Добавить дизайн"
3. Выберите режим "Загрузить файл"
4. Перетащите изображение или нажмите для выбора
5. Дождитесь загрузки и заполните остальные поля
6. Отправьте форму

Система автоматически загрузит изображение на сервер и вернет URL для сохранения в базе данных. 