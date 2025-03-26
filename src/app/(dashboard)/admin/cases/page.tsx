"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { getUsersWithCaseCounts } from "@/lib/api-service";
import { Skeleton } from "@/components/ui/Skeleton";
import { CaseTransferForm } from "@/components/admin/CaseTransferForm";
import { UserCaseLoadsTable } from "@/components/admin/UserCaseLoadsTable";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

// Create a context for managing refresh state across components
const RefreshContext = createContext<{
  refreshKey: number;
  triggerRefresh: () => void;
}>({
  refreshKey: 0,
  triggerRefresh: () => {},
});

// Color palette for charts
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884D8", // Purple
];

export default function AdminCasesPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    // Increment the refresh key to cause a re-render
    setRefreshKey((prev) => prev + 1);
    // Also refresh any server components
    router.refresh();
  };

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      <div className="container mx-auto p-4 space-y-4">
        {/* Header Section - More compact on mobile */}
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-green-500 w-5 h-5" />
            Case Management
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            <Info className="text-blue-500 w-4 h-4" />
            Manage case assignments and transfers
          </p>
        </div>

        {/* Main Grid - Full width for case load summary on desktop */}
        <div className="grid grid-cols-1 gap-4">
          {/* Transfer Cases Card */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200 p-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500 w-5 h-5" />
                Transfer Cases
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Transfer all cases from one user to another
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <CaseTransferFormContainer />
            </CardContent>
          </Card>

          {/* Case Load Summary Card */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-slate-200 p-4">
              <CardTitle className="text-lg text-slate-800">
                Case Load Summary
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Cases per user
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <UserCaseLoadsContainer />
            </CardContent>
          </Card>
        </div>
      </div>
    </RefreshContext.Provider>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <Skeleton className="h-8 sm:h-10 w-full bg-slate-100" />
      <Skeleton className="h-8 sm:h-10 w-full bg-slate-100" />
      <Skeleton className="h-8 sm:h-10 w-full bg-slate-100" />
    </div>
  );
}

function CaseTransferFormContainer() {
  const { refreshKey, triggerRefresh } = useContext(RefreshContext);
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
        setError("Failed to load users");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [refreshKey]);

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

  return (
    <div className="space-y-6">
      <CaseTransferForm users={users} onSuccess={triggerRefresh} />
    </div>
  );
}

function UserCaseLoadsContainer() {
  const { refreshKey } = useContext(RefreshContext);
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
        setError("Failed to load users");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [refreshKey]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-red-600 p-3 bg-red-50 rounded-md border border-red-200 text-sm">
        Error loading users: {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-slate-600 p-3 bg-slate-50 rounded-md border border-slate-200 text-sm">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserCaseLoadsTable users={users} />
      <ResponsiveCaseLoadChart users={users} />
    </div>
  );
}

function ResponsiveCaseLoadChart({ users }: { users: any[] }) {
  const usersWithCases = users.filter((user) => user.caseCount > 0);

  if (usersWithCases.length === 0) {
    return (
      <div className="text-center py-3 text-slate-600 bg-slate-50 rounded-md text-sm">
        <p>No active cases assigned to any users</p>
      </div>
    );
  }

  const totalCases = usersWithCases.reduce((sum, u) => sum + u.caseCount, 0);
  const chartData = usersWithCases.map((user, index) => ({
    name: user.name,
    value: user.caseCount,
    fill: COLORS[index % COLORS.length],
    percentage: (user.caseCount / totalCases) * 100,
  }));

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={60}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white shadow-md rounded-md p-3 border border-slate-200 text-sm">
                      <p className="font-semibold text-slate-800">{data.name}</p>
                      <p className="text-slate-600">
                        {data.value} cases ({data.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              background={{ fill: "#f5f5f5" }}
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  className="hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-sm"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm truncate">{item.name}</span>
            <span className="text-sm ml-1 text-slate-500">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
