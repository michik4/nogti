# Примеры использования системы рейтингов

## Основные сценарии использования

### 1. Создание отзыва

**Клиентский запрос:**
```javascript
const newReview = await masterRatingService.sendReview({
  masterId: "123e4567-e89b-12d3-a456-426614174000",
  ratingNumber: 5,
  description: "Отличная работа! Очень довольна результатом.",
  client: currentUser.id
});
```

**API запрос:**
```bash
curl -X POST "http://localhost:3000/api/master-rating/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "masterId": "123e4567-e89b-12d3-a456-426614174000",
    "ratingNumber": 5,
    "description": "Отличная работа! Очень довольна результатом."
  }'
```

### 2. Редактирование отзыва

**Клиентский запрос:**
```javascript
const updatedReview = await masterRatingService.updateReview(
  "review-uuid-here",
  {
    ratingNumber: 4,
    description: "Хорошая работа, но есть небольшие замечания."
  }
);
```

**API запрос:**
```bash
curl -X PUT "http://localhost:3000/api/master-rating/review-uuid-here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ratingNumber": 4,
    "description": "Хорошая работа, но есть небольшие замечания."
  }'
```

### 3. Удаление отзыва

**Клиентский запрос:**
```javascript
await masterRatingService.deleteReview("review-uuid-here");
```

**API запрос:**
```bash
curl -X DELETE "http://localhost:3000/api/master-rating/review-uuid-here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Получение отзывов мастера

**Клиентский запрос:**
```javascript
const reviews = await masterRatingService.getMasterRatingById("master-uuid-here");
```

**API запрос:**
```bash
curl -X GET "http://localhost:3000/api/master-rating/master-uuid-here?page=1&limit=10"
```

## CLI команды для администрирования

### Просмотр общей статистики
```bash
npm run cli rating stats
```

Результат:
```
📈 Общая статистика:
┌─────────────────┬─────────────────────┬────────────────┬─────────────────┐
│ Всего мастеров  │ Мастеров с отзывами │ Всего отзывов  │ Средний рейтинг │
├─────────────────┼─────────────────────┼────────────────┼─────────────────┤
│ 15              │ 8                   │ 45             │ 4.3             │
└─────────────────┴─────────────────────┴────────────────┴─────────────────┘
```

### Статистика конкретного мастера
```bash
npm run cli rating stats 123e4567-e89b-12d3-a456-426614174000
```

### Детали конкретного отзыва
```bash
npm run cli rating review 987fcdeb-51a2-43f6-b789-426614174123
```

### Пересчет всех рейтингов
```bash
npm run cli rating recalc
```

## Примеры использования в React компонентах

### Компонент с редактированием отзыва

```jsx
const ReviewItem = ({ review, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const canEdit = user?.id === review.client.id;
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleUpdate = async (updatedData) => {
    try {
      await masterRatingService.updateReview(review.id, updatedData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Ошибка при обновлении отзыва:', error);
    }
  };
  
  const handleDelete = async () => {
    if (confirm('Удалить отзыв?')) {
      try {
        await masterRatingService.deleteReview(review.id);
        onDelete();
      } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
      }
    }
  };

  return (
    <div className="review-item">
      {isEditing ? (
        <AddReviewForm 
          master={review.nailMaster}
          editingReview={review}
          onReviewAdded={handleUpdate}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <div>
          <div className="review-content">
            <h4>{review.client.fullName}</h4>
            <div className="rating">
              {'⭐'.repeat(review.ratingNumber)}
            </div>
            <p>{review.description}</p>
          </div>
          
          {canEdit && (
            <div className="review-actions">
              <button onClick={handleEdit}>
                <Edit size={16} />
              </button>
              <button onClick={handleDelete}>
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Типичные ошибки и их решения

### 1. Ошибка 403: "Вы можете редактировать только свои отзывы"

**Причина:** Пользователь пытается редактировать чужой отзыв.

**Решение:** Проверяйте авторство отзыва на клиенте:
```javascript
const canEdit = currentUser?.id === review.client.id;
```

### 2. Ошибка 404: "Отзыв не найден"

**Причина:** Отзыв был удален или ID неверный.

**Решение:** Обновите список отзывов и проверьте корректность ID.

### 3. Рейтинг не обновляется

**Причина:** Ошибка в пересчете рейтинга после изменения отзыва.

**Решение:** Запустите пересчет вручную:
```bash
npm run cli rating recalc
```

## Рекомендации по UX

### Обратная связь пользователю
```javascript
// При успешном обновлении
toast.success('Отзыв успешно обновлен');

// При успешном удалении  
toast.success('Отзыв удален');

// При ошибке
toast.error('Не удалось обновить отзыв. Попробуйте снова.');
```

### Подтверждение удаления
```jsx
const confirmDelete = () => {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие нельзя отменить. Ваш отзыв будет удален навсегда.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

### Индикация режима редактирования
```jsx
{isEditing ? (
  <div className="border-2 border-blue-500 rounded-lg p-4">
    <h4 className="text-blue-600 mb-2">Редактирование отзыва</h4>
    <EditForm />
  </div>
) : (
  <ReviewDisplay />
)}
``` 