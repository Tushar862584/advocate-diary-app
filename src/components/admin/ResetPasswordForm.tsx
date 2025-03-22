'use client';

import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface ResetPasswordFormProps {
  userId: string;
  userName: string;
}

export function ResetPasswordForm({ userId, userName }: ResetPasswordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess('');
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      // Reset form and show success message
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password reset successfully');
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-600 hover:bg-slate-700 text-white"
      >
        Reset Password
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password for {userName}</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the user's password. They will need to use the new password for their next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <Alert variant="error" className="mb-4 bg-red-50 border-red-200 text-red-800">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="mb-4 bg-green-50 border-green-200 text-green-800">
                {success}
              </Alert>
            )}
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                disabled={isSubmitting}
                minLength={8}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-400 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                disabled={isSubmitting}
                minLength={8}
              />
            </div>
          
            <AlertDialogFooter>
              <AlertDialogCancel 
                type="button" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-800 hover:bg-slate-700"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 