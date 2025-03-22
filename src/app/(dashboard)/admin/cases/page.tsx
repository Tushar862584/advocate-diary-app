'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getUsersWithCaseCounts } from '@/lib/api-service';
import { Skeleton } from '@/components/ui/Skeleton';
import { CaseTransferForm } from '@/components/admin/CaseTransferForm';
import { UserCaseLoadsTable } from '@/components/admin/UserCaseLoadsTable';

export default function AdminCasesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Case Management</h1>
        <p className="text-slate-500">Manage case assignments and transfers between users</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">Transfer Cases</CardTitle>
              <CardDescription className="text-slate-500">
                Transfer all cases from one user to another
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CaseTransferFormContainer />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="shadow-md border-slate-200 h-full">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">Case Load Summary</CardTitle>
              <CardDescription className="text-slate-500">
                Number of cases assigned to each user
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <UserCaseLoadsContainer />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full bg-slate-100" />
      <Skeleton className="h-10 w-full bg-slate-100" />
      <Skeleton className="h-10 w-full bg-slate-100" />
    </div>
  );
}

function CaseTransferFormContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await getUsersWithCaseCounts();
        
        if (response.error) {
          setError(response.error);
        } else {
          setUsers(response.data || []);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
        Error loading users: {error}
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-slate-600 p-4 bg-slate-50 rounded-md border border-slate-200">
        No users found with cases to transfer
      </div>
    );
  }
  
  return <CaseTransferForm users={users} />;
}

function UserCaseLoadsContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await getUsersWithCaseCounts();
        
        if (response.error) {
          setError(response.error);
        } else {
          setUsers(response.data || []);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
        Error loading users: {error}
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-slate-600 p-4 bg-slate-50 rounded-md border border-slate-200">
        No users found
      </div>
    );
  }
  
  return <UserCaseLoadsTable users={users} />;
} 