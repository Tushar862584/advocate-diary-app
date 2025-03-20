"use client"

import * as React from "react"
import { X } from "lucide-react"

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
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

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  // Use portal to avoid z-index issues
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-slate-800 p-6 shadow-xl">
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 className="text-xl font-semibold text-slate-100">{children}</h2>;
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p className="mt-2 text-sm text-slate-300">{children}</p>;
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
  ...props
}: AlertDialogCancelProps) {
  return (
    <button
      className={`rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
