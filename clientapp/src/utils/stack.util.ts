/**
 * Форматирует строку стека вызовов, очищая её от лишней информации
 * @param stack - строка стека вызовов
 * @returns отформатированный стек вызовов
 */
export const formatCallStack = (stack: string | undefined): string => {
  if (!stack) return '';

  return stack
    .split('\n')
    .slice(1) // Пропускаем первую строку (Error)
    .map(line => {
      // Извлекаем только нужные части из строки стека
      const regex = /at\s+(\w+(?:\.\w+)*)\s+\((.+?)(?:\?t=\d+)?:(\d+:\d+)\)/;
      const match = line.match(regex);
      if (!match) return null;

      const [, functionName, filePath, position] = match;
      
      // Извлекаем путь, начиная с src/
      const srcMatch = filePath.match(/src\/.+/);
      if (!srcMatch) return null;

      return `at ${functionName} (${srcMatch[0]}:${position})`;
    })
    .filter(Boolean) // Убираем null значения
    .join('\n');
};

/**
 * Получает отформатированный стек вызовов для текущей точки выполнения
 * @param skipFrames - количество фреймов стека, которые нужно пропустить
 * @returns отформатированный стек вызовов
 */
export const getCallStack = (skipFrames: number = 1): string => {
  const stack = new Error().stack;
  if (!stack) return '';

  // Пропускаем дополнительные фреймы (включая вызов getCallStack)
  const slicedStack = stack
    .split('\n')
    .slice(skipFrames + 1)
    .join('\n');

  return formatCallStack(slicedStack);
}; 