# Система загрузки аватаров

## Обзор

Компонент `AvatarUpload` предоставляет интерфейс для загрузки и редактирования аватаров пользователей с поддержкой предварительного просмотра, индикаторов загрузки и различных размеров.

## Обновление стилей (25.01.2025)

### Переход на CSS Modules

Компонент был переработан для использования CSS Modules вместо Tailwind CSS классов:

#### Структура файлов
```
src/components/ui/
├── avatar-upload.tsx          # Основной компонент
└── avatar-upload.module.css   # Стили CSS Modules
```

#### Преимущества CSS Modules

1. **Изолированность стилей** - классы автоматически скоупированы
2. **Лучшая производительность** - нет зависимости от больших CSS фреймворков
3. **Типизация** - TypeScript может проверить существование CSS классов
4. **Кастомизация** - легче настраивать уникальные стили

### Архитектура стилей

#### Размеры компонента
```css
.avatarSm { width: 4rem; height: 4rem; }    /* 64px */
.avatarMd { width: 6rem; height: 6rem; }    /* 96px */
.avatarLg { width: 8rem; height: 8rem; }    /* 128px */
```

#### Интерактивные состояния
```css
.avatarGroup:hover .hoverOverlay {
  opacity: 1;
}

.avatar.uploading {
  opacity: 0.75;
}
```

#### Анимации
```css
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Компоненты системы

### 1. Основной компонент (`AvatarUpload`)

**Свойства:**
- `currentAvatar?: string` - URL текущего аватара
- `userName?: string` - Имя пользователя для fallback
- `onAvatarUpdate?: (url: string) => void` - Callback при обновлении
- `size?: "sm" | "md" | "lg"` - Размер компонента
- `showUploadButton?: boolean` - Показывать кнопку загрузки
- `className?: string` - Дополнительные CSS классы

### 2. Функциональность

#### Загрузка файлов
```typescript
const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Создание превью
  const fileUrl = URL.createObjectURL(file);
  setPreviewUrl(fileUrl);

  // Загрузка на сервер
  const result = await userService.updateAvatar(file);
  
  // Обновление состояния
  setUploadedAvatarUrl(result.avatar_url);
};
```

#### Приоритет отображения
1. **Превью** - локальный файл во время загрузки
2. **Загруженный аватар** - результат последней загрузки
3. **Переданный аватар** - из пропсов компонента
4. **Fallback** - первая буква имени пользователя

### 3. Состояния компонента

#### Состояние загрузки
- Показывается спиннер
- Аватар становится полупрозрачным
- Кнопки становятся неактивными

#### Hover эффекты
- На размерах `md` и `lg` показывается overlay с иконкой камеры
- Кнопка загрузки меняет стиль при наведении

## CSS классы

### Основные контейнеры
```css
.container          /* Корневой контейнер */
.avatarGroup        /* Группа аватара с hover эффектами */
.buttonContainer    /* Контейнер кнопки загрузки */
```

### Размеры
```css
.avatarSm, .avatarMd, .avatarLg    /* Размеры аватара */
.iconSm, .iconMd, .iconLg          /* Размеры иконок */
.buttonSm, .buttonMd, .buttonLg    /* Размеры кнопки */
```

### Состояния
```css
.uploading          /* Состояние загрузки */
.loading            /* Анимация вращения */
.hoverOverlay       /* Overlay при hover */
.loadingOverlay     /* Overlay во время загрузки */
```

## Интеграция с AuthContext

```typescript
// Обновление аватара в контексте пользователя
if (currentUser && updateUser) {
  updateUser({
    ...currentUser,
    avatar: result.avatar_url
  });
}
```

## Обработка ошибок

- Показ toast уведомлений при ошибках
- Очистка превью при неудачной загрузке
- Восстановление предыдущего состояния

## Поддерживаемые форматы

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- GIF (`.gif`)

## Использование

### Базовое использование
```tsx
<AvatarUpload
  currentAvatar={user.avatar}
  userName={user.name}
  onAvatarUpdate={(url) => console.log('Новый аватар:', url)}
/>
```

### С различными размерами
```tsx
<AvatarUpload size="sm" showUploadButton={false} />
<AvatarUpload size="md" />
<AvatarUpload size="lg" />
```

### В профиле пользователя
```tsx
<AvatarUpload
  currentAvatar={currentUser.avatar}
  userName={displayName}
  size="lg"
  onAvatarUpdate={(newAvatarUrl) => {
    // Обновление через AuthContext происходит автоматически
  }}
/>
```

## Производительность

- Автоматическая очистка URL.createObjectURL
- Дебаунсинг при множественных обновлениях
- Оптимизированные CSS анимации
- Ленивая загрузка превью

## Доступность

- Семантичные HTML элементы
- Правильные ARIA атрибуты
- Keyboard navigation поддержка
- Screen reader совместимость

## Дата последнего обновления

25 января 2025 года - переход на CSS Modules 