import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, Briefcase, Layout } from "lucide-react"; // Add Lucide icons
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const usersCount = await prisma.user.count();
  const activeCases = await prisma.case.count({
    where: { isCompleted: false },
  });
  const closedCases = await prisma.case.count({
    where: { isCompleted: true },
  });

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {session.user.name}. Manage your system from here.
          </p>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Advocates", value: usersCount, color: "blue" },
            { label: "Active Cases", value: activeCases, color: "red" },
            { label: "Closed Cases", value: closedCases, color: "green" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4 text-center transition-transform hover:scale-105`}
            >
              <p className={`text-${color}-600 text-sm font-medium`}>{label}</p>
              <p className={`text-${color}-700 text-2xl font-bold mt-1`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Management Card */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 text-slate-200">
              <Users size={48} />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">
                User Management
              </h2>
              <p className="mt-2 mb-4 text-sm text-slate-600">
                Create, edit, and delete user accounts. Manage access to the
                system.
              </p>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white 
                         transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Manage Users
                <span className="text-blue-200">→</span>
              </Link>
            </div>
          </div>

          {/* Case Management Card */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 text-slate-200">
              <Briefcase size={48} />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Case Management
              </h2>
              <p className="mt-2 mb-4 text-sm text-slate-600">
                Assign cases to users, transfer cases between users, or handle
                unassigned cases.
              </p>
              <Link
                href="/admin/cases"
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white 
                         transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Manage Cases
                <span className="text-purple-200">→</span>
              </Link>
            </div>
          </div>

          {/* View Cases Card */}
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 text-slate-200">
              <Layout size={48} />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800">
                View All Cases
              </h2>
              <p className="mt-2 mb-4 text-sm text-slate-600">
                See all cases in the system, including assigned and unassigned
                cases.
              </p>
              <Link
                href="/cases"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white 
                         transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                View Cases
                <span className="text-green-200">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
