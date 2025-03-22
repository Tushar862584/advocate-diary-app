import { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  children: ReactNode;
  variant: AlertVariant;
  title?: string;
  className?: string;
}

export function Alert({ children, variant, title, className = '' }: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div 
      className={`rounded-md p-4 border ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
      <div className="text-sm">{children}</div>
    </div>
  );
} 