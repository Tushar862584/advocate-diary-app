"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

// Create a context for the dialog
type DialogContextType = {
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

// Hook to use dialog context
function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within an AlertDialog");
  }
  return context;
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// Simple portal implementation
function Portal({
  children,
  open
}: {
  children: React.ReactNode;
  open: boolean;
}) {
  // State to track client-side rendering
  const [mounted, setMounted] = React.useState(false);
  
  // Track if we've applied the overflow style
  const appliedStyleRef = React.useRef(false);
  // Store original style
  const originalStyleRef = React.useRef("");
  
  // Handle mounting
  React.useEffect(() => {
    setMounted(true);
    
    return () => {
      setMounted(false);
      // Always ensure we restore the style when unmounting
      if (appliedStyleRef.current) {
        document.body.style.overflow = originalStyleRef.current;
        appliedStyleRef.current = false;
      }
    };
  }, []);
  
  // Handle overflow style
  React.useEffect(() => {
    if (mounted && open) {
      // Save original only once
      if (!appliedStyleRef.current) {
        originalStyleRef.current = document.body.style.overflow || '';
        document.body.style.overflow = 'hidden';
        appliedStyleRef.current = true;
      }
    } else if (mounted && !open) {
      // Restore when dialog closes
      if (appliedStyleRef.current) {
        document.body.style.overflow = originalStyleRef.current;
        appliedStyleRef.current = false;
      }
    }
  }, [mounted, open]);
  
  // Handle escape key
  React.useEffect(() => {
    if (!mounted || !open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('dialog-escape'));
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mounted, open]);
  
  if (!mounted) return null;
  
  // Only create the portal if we're mounted and open
  if (!open) return null;
  
  return createPortal(children, document.body);
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  // Set up the escape event listener
  React.useEffect(() => {
    const handleEscape = () => {
      onOpenChange(false);
    };
    
    document.addEventListener('dialog-escape', handleEscape);
    return () => {
      document.removeEventListener('dialog-escape', handleEscape);
    };
  }, [onOpenChange]);
  
  // Handle backdrop click
  const handleBackdropClick = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  
  // Return the dialog content wrapped in the portal
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <Portal open={open}>
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <div 
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </Portal>
    </DialogContext.Provider>
  );
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return (
    <div className={`w-full max-w-md overflow-hidden rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto dark:bg-slate-800 ${className || ""}`}>
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

export function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
  return <h2 className={`text-xl font-semibold text-slate-900 dark:text-slate-100 ${className || ""}`}>{children}</h2>;
}

export function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps) {
  return <p className={`mt-2 text-sm text-slate-600 dark:text-slate-300 ${className || ""}`}>{children}</p>;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="mt-6 flex justify-end space-x-2">{children}</div>;
}

export function AlertDialogAction({
  children,
  className,
  ...props
}: AlertDialogActionProps) {
  return (
    <button
      className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({
  children,
  className,
  onClick,
  ...props
}: AlertDialogCancelProps) {
  const { onOpenChange } = useDialogContext();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Close the dialog
    onOpenChange(false);
    
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      type="button"
      className={`rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 ${
        className || ""
      }`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
