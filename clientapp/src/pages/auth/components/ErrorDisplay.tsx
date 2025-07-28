import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthError, AuthFieldError } from '@/types/api.types';

interface ErrorDisplayProps {
  error: AuthError | null;
  fieldErrors?: AuthFieldError[];
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  fieldErrors = [],
  onDismiss,
  className = ''
}) => {
  if (!error && fieldErrors.length === 0) return null;

  const getErrorVariant = (errorCode?: string) => {
    switch (errorCode) {
      case 'VALIDATION_ERROR':
        return 'default';
      case 'INVALID_CREDENTIALS':
      case 'USER_EXISTS':
        return 'destructive';
      case 'SERVER_ERROR':
      case 'NETWORK_ERROR':
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const getErrorIcon = (errorCode?: string) => {
    return <AlertCircle className="h-4 w-4" />;
  };

  // Группируем ошибки полей по полям
  const fieldErrorsMap = fieldErrors.reduce((acc, fieldError) => {
    if (!acc[fieldError.field]) {
      acc[fieldError.field] = [];
    }
    acc[fieldError.field].push(fieldError.message);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Основная ошибка */}
      {error && (
        <Alert variant={getErrorVariant(error.code)} className="relative">
          {getErrorIcon(error.code)}
          <AlertDescription className="pr-8">
            {error.message}
          </AlertDescription>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Alert>
      )}

      {/* Ошибки полей */}
      {Object.entries(fieldErrorsMap).map(([field, messages]) => (
        <Alert key={field} variant="default" className="relative">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="pr-8">
            <div className="space-y-1">
              {field !== 'general' && (
                <div className="font-medium text-sm">
                  {getFieldDisplayName(field)}:
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className="text-sm">
                  {message}
                </div>
              ))}
            </div>
          </AlertDescription>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Alert>
      ))}
    </div>
  );
};

// Вспомогательная функция для получения названий полей на русском
const getFieldDisplayName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    email: 'Email',
    password: 'Пароль',
    username: 'Имя пользователя',
    fullName: 'Полное имя',
    phone: 'Телефон'
  };
  
  return fieldNames[field] || field;
}; 