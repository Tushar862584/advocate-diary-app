'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      // Reset form and show success message
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccess('Password changed successfully');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-md shadow-md border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-slate-800">Change Password</CardTitle>
          <CardDescription className="text-slate-500">
            Update your account password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <Alert variant="error" className="mb-6 bg-red-50 border-red-200 text-red-800">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-6 bg-green-50 border-green-200 text-green-800">
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="bg-slate-800 hover:bg-slate-700 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 