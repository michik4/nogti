import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AuthFieldError } from '@/types/api.types';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  fieldErrors?: AuthFieldError[];
  children?: React.ReactNode; // Для кнопки показа/скрытия пароля
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  fieldErrors = [],
  children,
  className = ''
}) => {
  // Находим ошибки для этого поля
  const errors = fieldErrors.filter(error => error.field === id);
  const hasError = errors.length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className={cn(hasError && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={cn(
            hasError && "border-destructive focus-visible:ring-destructive",
            children && "pr-10" // Добавляем отступ справа если есть дочерние элементы (кнопка)
          )}
        />
        {children}
      </div>
      
      {/* Отображение ошибок поля */}
      {hasError && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}; 