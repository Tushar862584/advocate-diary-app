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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
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

// Color palette for pie chart
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884D8", // Purple
];

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white shadow-lg rounded-md p-4 border border-gray-200">
        <p className="font-bold text-gray-800">{data.name}</p>
        <p className="text-gray-600">Cases: {data.value}</p>
        <p className="text-sm text-gray-500">
          {((data.value / data.total) * 100).toFixed(1)}% of total cases
        </p>
      </div>
    );
  }
  return null;
};

function CaseLoadPieChart({ users }: { users: any[] }) {
  // Filter out users with zero cases
  const usersWithCases = users.filter((user) => user.caseCount > 0);

  // If no users have cases, show a message
  if (usersWithCases.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 bg-slate-50 rounded-md">
        <p>No active cases assigned to any users</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const chartData = usersWithCases.map((user, index) => ({
    name: user.name,
    value: user.caseCount,
    total: usersWithCases.reduce((sum, u) => sum + u.caseCount, 0),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="w-full h-48 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={({ maxRadius }) => Math.min(maxRadius * 0.8, 80)}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              window.innerWidth < 640
                ? `${(percent * 100).toFixed(0)}%`
                : `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout={window.innerWidth < 640 ? "vertical" : "horizontal"}
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              fontSize: window.innerWidth < 640 ? "12px" : "14px",
              padding: window.innerWidth < 640 ? "0 4px" : "0 8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ResponsiveChart({ users }: { users: any[] }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const usersWithCases = users.filter((user) => user.caseCount > 0);

  if (usersWithCases.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 bg-slate-50 rounded-md">
        <p>No active cases assigned to any users</p>
      </div>
    );
  }

  // Mobile Bar Chart
  if (isMobile) {
    return (
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={usersWithCases}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={70}
            />
            <Tooltip />
            <Bar
              dataKey="caseCount"
              fill="#0088FE"
              name="Cases"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Desktop Pie Chart (existing implementation)
  return <CaseLoadPieChart users={users} />;
}

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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 bg-gray-50 min-h-screen">
        {/* Header Section - More compact on mobile */}
        <div className="flex flex-col space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="text-green-500 w-6 h-6 sm:w-9 sm:h-9" />
            Case Management
          </h1>
          <p className="text-slate-500 text-sm sm:text-lg flex items-center gap-2">
            <Info className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
            Manage case assignments and transfers
          </p>
        </div>

        {/* Main Grid - Stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Transfer Cases Card */}
          <div className="space-y-4 sm:space-y-8">
            <Card className="shadow-md sm:shadow-xl border-slate-200 rounded-lg sm:rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500 w-5 h-5 sm:w-6 sm:h-6" />
                  Transfer Cases
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600">
                  Transfer all cases from one user to another
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <CaseTransferFormContainer />
              </CardContent>
            </Card>
          </div>

          {/* Expanded Case Load Summary Card */}
          <div>
            <Card className="shadow-md sm:shadow-xl border-slate-200 h-full rounded-lg sm:rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-slate-200 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800">
                  Case Load Summary
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600">
                  Cases per user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <UserCaseLoadsContainer />
              </CardContent>
            </Card>
          </div>
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

  return (
    <div className="space-y-6">
      <UserCaseLoadsTable users={users} />
      <ResponsiveCaseLoadChart users={users} />
    </div>
  );
}

function ResponsiveCaseLoadChart({ users }: { users: any[] }) {
  const usersWithCases = users.filter((user) => user.caseCount > 0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (usersWithCases.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 bg-slate-50 rounded-md">
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

  if (isMobile) {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="30%"
            outerRadius="100%"
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background
              dataKey="percentage"
              cornerRadius={8}
              label={({ value }) => `${value.toFixed(0)}%`}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                fontSize: "12px",
                paddingLeft: "10px",
              }}
            />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white shadow-lg rounded-md p-3 border border-gray-200">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-gray-600">
                        {data.value} cases ({data.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Desktop PieChart
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={({ maxRadius }) => Math.min(maxRadius * 0.8, 120)}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              fontSize: "14px",
              padding: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
