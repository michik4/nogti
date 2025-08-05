import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Bug, Copy, Check } from 'lucide-react';
import styles from './DebugModal.module.css';

interface DebugModalProps {
  data: any;
  title?: string;
  showInProduction?: boolean;
}

const DebugModal: React.FC<DebugModalProps> = ({ 
  data, 
  title = 'Отладочная информация', 
  showInProduction = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Функция для синтаксической подсветки JSON
  const highlightJSON = (jsonString: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Регулярные выражения для поиска различных типов токенов
    const patterns = [
      { regex: /(".*?":)/g, className: styles.jsonKey }, // Ключи
      { regex: /(".*?")/g, className: styles.jsonString }, // Строки
      { regex: /(\d+)/g, className: styles.jsonNumber }, // Числа
      { regex: /(true|false|null)/g, className: styles.jsonBoolean } // Булевы и null
    ];
    
    // Создаем массив всех совпадений
    const matches = [];
    patterns.forEach(({ regex, className }) => {
      let match;
      while ((match = regex.exec(jsonString)) !== null) {
        matches.push({
          index: match.index,
          text: match[0],
          className
        });
      }
    });
    
    // Сортируем совпадения по позиции
    matches.sort((a, b) => a.index - b.index);
    
    // Строим результат
    matches.forEach(match => {
      if (match.index >= lastIndex) {
        // Добавляем текст между совпадениями
        if (match.index > lastIndex) {
          parts.push(jsonString.slice(lastIndex, match.index));
        }
        // Добавляем подсвеченный токен
        parts.push(
          <span key={`${match.index}-${match.className}`} className={match.className}>
            {match.text}
          </span>
        );
        lastIndex = match.index + match.text.length;
      }
    });
    
    // Добавляем оставшийся текст
    if (lastIndex < jsonString.length) {
      parts.push(jsonString.slice(lastIndex));
    }
    
    return parts;
  };

  // Не показываем в продакшене, если не указано иное
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCopyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      
      // Сбрасываем состояние через 2 секунды
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(data, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={styles.debugButton}
        title="Отладочная информация"
      >
        <Bug className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={styles.debugModal}>
          <DialogHeader>
            <DialogTitle className={styles.debugHeader}>
              <Bug className="w-5 h-5" />
              {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className={`${styles.debugSection} ${styles.debugDataSection}`}>
              <div className={styles.debugDataHeader}>
                <h4 className={styles.debugDataTitle}>Данные:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className={styles.copyButton}
                  title="Копировать JSON"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Скопировано!' : 'Копировать'}
                </Button>
              </div>
              <pre className={styles.debugDataContent}>
                {highlightJSON(JSON.stringify(data, null, 2))}
              </pre>
            </div>

            <div className={`${styles.debugSection} ${styles.debugTypeSection}`}>
              <h4 className={styles.debugDataTitle}>Тип данных:</h4>
              <p className={styles.debugTypeText}>
                {typeof data} {Array.isArray(data) ? `(массив, ${data.length} элементов)` : ''}
              </p>
            </div>

            {data && typeof data === 'object' && (
              <div className={`${styles.debugSection} ${styles.debugKeysSection}`}>
                <h4 className={styles.debugDataTitle}>Ключи объекта:</h4>
                <div className={styles.debugKeysContainer}>
                  {Object.keys(data).map((key) => (
                    <span 
                      key={key} 
                      className={styles.debugKeyTag}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.debugActions}>
            <Button variant="outline" onClick={handleClose}>
              Закрыть
            </Button>
            <Button 
              onClick={() => {
                console.log('Debug data:', data);
                handleClose();
              }}
            >
              Вывести в консоль
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DebugModal; 