export const formatCustomDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    // Функция для добавления ведущего нуля, если число меньше 10
    const padTo2Digits = (num: number) => {
      return num.toString().padStart(2, '0');
    };



    // Если прошло меньше минуты
    if (diffInMinutes < 1) {
      return 'только что';
    }
    
    // Если прошло меньше часа
    if (diffInMinutes < 60) {
      return `${diffInMinutes}м`;
    }
    
    // Если прошло меньше дня
    if (diffInHours < 24) {
      return `${diffInHours}ч`;
    }
    
    // Если прошло меньше недели
    if (diffInDays < 7) {
      return `${diffInDays}д`;
    }
    
    // Если прошло меньше месяца
    if (diffInWeeks < 4) {
      return `${diffInWeeks}н`;
    }
    
    // Если прошло меньше года
    if (diffInMonths < 12) {
      return `${diffInMonths}м`;
    }
    
    // Если прошло больше года
    if (diffInYears >= 1) {
      return `${diffInYears}г`;
    }

    // Fallback на полную дату
    const day = padTo2Digits(date.getDate());
    const month = padTo2Digits(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = padTo2Digits(date.getHours());
    const minutes = padTo2Digits(date.getMinutes());

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export const formatDetailedDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    
    // Функция для добавления ведущего нуля, если число меньше 10
    const padTo2Digits = (num: number) => {
      return num.toString().padStart(2, '0');
    };

    const day = padTo2Digits(date.getDate());
    const month = padTo2Digits(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = padTo2Digits(date.getHours());
    const minutes = padTo2Digits(date.getMinutes());

    // Получаем название месяца
    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const monthName = monthNames[date.getMonth()];

    return `${day} ${monthName} ${year} в ${hours}:${minutes}`;
}