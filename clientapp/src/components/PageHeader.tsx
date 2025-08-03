import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  showBackButton = true, 
  onBackClick,
  className = ""
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border ${className}`}>
      <div className="flex items-center justify-between p-4">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <div className="w-10 h-10" />
        )}
        <div className="flex flex-col items-center">
          <h1 className="font-semibold text-lg">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground text-center">{subtitle}</p>
          )}
        </div>
        <div className="w-10 h-10" />
      </div>
    </header>
  );
};

export default PageHeader; 