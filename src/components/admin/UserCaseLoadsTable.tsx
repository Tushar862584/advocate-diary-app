import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/Table';

type UserCaseLoad = {
  id: string;
  name: string;
  email: string;
  role: string;
  caseCount: number;
};

interface UserCaseLoadsTableProps {
  users: UserCaseLoad[];
}

export function UserCaseLoadsTable({ users }: UserCaseLoadsTableProps) {
  // Sort users by case count in descending order
  const sortedUsers = [...users].sort((a, b) => b.caseCount - a.caseCount);
  
  return (
    <div className="overflow-y-auto max-h-72 rounded-md border border-slate-200">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-b border-slate-200">
            <TableHead className="font-semibold text-slate-600 py-3">User</TableHead>
            <TableHead className="font-semibold text-slate-600 py-3">Role</TableHead>
            <TableHead className="font-semibold text-slate-600 py-3 text-right">Cases</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
              <TableCell className="py-3 text-slate-800">
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role}
                </span>
              </TableCell>
              <TableCell className="py-3 text-right font-medium text-slate-800">
                {user.caseCount}
              </TableCell>
            </TableRow>
          ))}
          
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 