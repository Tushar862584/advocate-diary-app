import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

type CardTitleProps = {
  children: ReactNode;
  className?: string;
};

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>;
}

type CardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`p-4 border-t ${className}`}>{children}</div>;
}

type CardDescriptionProps = {
  children: ReactNode;
  className?: string;
};

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
} 