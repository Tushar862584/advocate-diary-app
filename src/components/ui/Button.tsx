import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  className?: string;
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  // Base styles that apply to all buttons
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  // Variant-specific styles
  const variantStyles = {
    default: "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-800",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-800",
    link: "bg-transparent underline-offset-4 hover:underline text-slate-800 p-0 h-auto",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
  };
  
  // Size-specific styles
  const sizeStyles = {
    default: "h-10 px-4 py-2 text-sm rounded-md",
    sm: "h-8 px-3 text-xs rounded-md",
    lg: "h-12 px-6 text-base rounded-lg",
    icon: "h-10 w-10 rounded-md"
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
} 