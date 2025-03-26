import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, Briefcase, Layout, FileText, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/db";

// Define types for our data structures
type StatCard = {
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "amber" | "purple";
  icon: React.ReactNode;
};

type ActionCard = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  buttonText: string;
  color: "blue" | "green" | "red" | "amber" | "purple";
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch data for statistics
  const usersCount = await prisma.user.count();
  const activeCases = await prisma.case.count({
    where: {
      isCompleted: false,
      NOT: { caseType: "PERSONAL" },
    },
  });
  const closedCases = await prisma.case.count({
    where: { isCompleted: true },
  });

  // Define statistics cards
  const stats: StatCard[] = [
    {
      label: "Total Advocates",
      value: usersCount,
      color: "blue",
      icon: <Users size={20} className="text-blue-500" />,
    },
    {
      label: "Active Cases",
      value: activeCases,
      color: "red",
      icon: <Briefcase size={20} className="text-red-500" />,
    },
    {
      label: "Closed Cases",
      value: closedCases,
      color: "green",
      icon: <BarChart3 size={20} className="text-green-500" />,
    },
  ];

  // Define action cards
  const actionCards: ActionCard[] = [
    {
      title: "User Management",
      description:
        "Create, edit, and manage user accounts and access permissions.",
      icon: <Users size={40} />,
      href: "/admin/users",
      buttonText: "Manage Users",
      color: "blue",
    },
    {
      title: "Case Management",
      description:
        "Assign and transfer cases between users, handle unassigned cases.",
      icon: <Briefcase size={40} />,
      href: "/admin/cases",
      buttonText: "Manage Cases",
      color: "purple",
    },
    {
      title: "Personal Information",
      description:
        "Manage user data, documents, and files stored in the system.",
      icon: <FileText size={40} />,
      href: "/admin/personal-info",
      buttonText: "Manage Information",
      color: "amber",
    },
    {
      title: "View All Cases",
      description:
        "See all cases in the system, including assigned and unassigned.",
      icon: <Layout size={40} />,
      href: "/cases",
      buttonText: "View Cases",
      color: "green",
    },
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2 px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Welcome back, {session.user.name}. Manage your system from here.
          </p>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          {stats.map((stat) => (
            <StatCardComponent key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Main Cards Grid */}
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {actionCards.map((card) => (
            <ActionCardComponent key={card.title} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCardComponent({ stat }: { stat: StatCard }) {
  const bgColor = `bg-${stat.color}-50`;
  const borderColor = `border-${stat.color}-100`;
  const textColor = `text-${stat.color}-700`;
  const labelColor = `text-${stat.color}-600`;

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-xl p-3 sm:p-4 text-center transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {stat.icon}
        <p className={`${labelColor} text-xs sm:text-sm font-medium`}>
          {stat.label}
        </p>
      </div>
      <p className={`${textColor} text-xl sm:text-2xl font-bold`}>
        {stat.value}
      </p>
    </div>
  );
}

// Action card component
function ActionCardComponent({ card }: { card: ActionCard }) {
  const buttonBg = `bg-${card.color}-600`;
  const buttonHover = `hover:bg-${card.color}-700`;
  const buttonRing = `focus:ring-${card.color}-500`;
  const buttonTextColor = `text-${card.color}-200`;
  const iconColor = `text-${card.color}-100`;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Position the icon with lower z-index to ensure it stays behind text */}
      <div className="absolute right-2 sm:right-4 top-2 sm:top-4 opacity-30 pointer-events-none z-0">
        <div className={iconColor}>{card.icon}</div>
      </div>

      {/* Content with higher z-index to appear above the icon */}
      <div className="p-3 sm:p-6 relative z-10">
        <h2 className="text-base sm:text-xl font-semibold text-slate-800">
          {card.title}
        </h2>
        <p className="mt-1 sm:mt-2 mb-2 sm:mb-4 text-xs sm:text-sm text-slate-600 line-clamp-2">
          {card.description}
        </p>
        <Link
          href={card.href}
          className={`inline-flex items-center gap-1 sm:gap-2 rounded-lg ${buttonBg} px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white 
                   transition-colors ${buttonHover} focus:outline-none focus:ring-2 ${buttonRing} focus:ring-offset-1`}
        >
          {card.buttonText}
          <span className={`${buttonTextColor}`}>→</span>
        </Link>
      </div>
    </div>
  );
}
