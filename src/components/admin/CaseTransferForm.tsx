'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { reassignCases } from '@/lib/api-service';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  caseCount: number;
};

interface CaseTransferFormProps {
  users: User[];
}

export function CaseTransferForm({ users }: CaseTransferFormProps) {
  const router = useRouter();
  const [sourceUserId, setSourceUserId] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transferDetails, setTransferDetails] = useState({ sourceUser: '', targetUser: '', caseCount: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccessMessage('');
    
    // Validate the form
    if (!sourceUserId) {
      setError('Please select a source user');
      return;
    }
    
    if (!targetUserId) {
      setError('Please select a target user');
      return;
    }
    
    // Prepare for confirmation
    const sourceUser = users.find(u => u.id === sourceUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    
    if (sourceUser && targetUser) {
      setTransferDetails({
        sourceUser: sourceUser.name,
        targetUser: targetUser.name,
        caseCount: sourceUser.caseCount
      });
      setShowConfirmDialog(true);
    }
  };
  
  const confirmTransfer = async () => {
    setIsSubmitting(true);
    
    try {
      // Transfer cases
      const result = await reassignCases({
        sourceUserId,
        targetUserId,
      });
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setSuccessMessage(result.data.message);
        
        // Reset form
        setSourceUserId('');
        setTargetUserId('');
        
        // Refresh the page data
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const sourceOptions = users
    .filter(user => user.caseCount > 0)
    .map(user => ({
      value: user.id,
      label: `${user.name} (${user.caseCount} cases)`,
    }));

  const targetOptions = users
    .filter(user => user.id !== sourceUserId)
    .map(user => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }));

  return (
    <div className="bg-white">
      {successMessage && (
        <Alert variant="success" className="mb-6 bg-green-50 border-green-200 text-green-800">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="error" className="mb-6 bg-red-50 border-red-200 text-red-800">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Select
            label="Source User"
            value={sourceUserId}
            onChange={(e) => setSourceUserId(e.target.value)}
            options={sourceOptions}
            placeholder="-- Select user with cases --"
            required
            className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
          />
          
          <Select
            label="Target User"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            options={targetOptions}
            placeholder="-- Select destination user --"
            required
            className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || sourceOptions.length === 0}
            className="bg-slate-800 hover:bg-slate-700 text-white"
          >
            Transfer Cases
          </Button>
        </div>
        
        {sourceOptions.length === 0 && (
          <p className="text-sm text-slate-500 italic mt-2">
            No users with cases available for transfer
          </p>
        )}
      </form>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Case Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer all cases ({transferDetails.caseCount}) from {transferDetails.sourceUser} to {transferDetails.targetUser}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmTransfer} 
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {isSubmitting ? 'Transferring...' : 'Transfer Cases'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 