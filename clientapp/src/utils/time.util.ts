export const formatCustomDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
  
    // Функция для добавления ведущего нуля, если число меньше 10
    const padTo2Digits = (num: number) => {
      return num.toString().padStart(2, '0');
    };
  
    const day = padTo2Digits(date.getDate());
    const month = padTo2Digits(date.getMonth() + 1); // getMonth() возвращает 0-11
    const year = date.getFullYear();
    const hours = padTo2Digits(date.getHours());
    const minutes = padTo2Digits(date.getMinutes());
  
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}