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
      color: "red",
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
  // Map color to specific tailwind classes
  const getStatCardClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-100 text-blue-700 label-text-blue-600";
      case "green":
        return "bg-green-50 border-green-100 text-green-700 label-text-green-600";
      case "red":
        return "bg-red-50 border-red-100 text-red-700 label-text-red-600";
      case "amber":
        return "bg-amber-50 border-amber-100 text-amber-700 label-text-amber-600";
      case "purple":
        return "bg-purple-50 border-purple-100 text-purple-700 label-text-purple-600";
      default:
        return "bg-slate-50 border-slate-100 text-slate-700 label-text-slate-600";
    }
  };

  const classes = getStatCardClasses(stat.color);
  const [bgColor, borderColor, textColor] = classes.split(" ");
  const labelColorClass = classes.split(" ")[3].replace("label-text", "text");

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-xl p-3 sm:p-4 text-center transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {stat.icon}
        <p className={`${labelColorClass} text-xs sm:text-sm font-medium`}>
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
  // Instead of using dynamic classes, map colors to specific tailwind classes
  const getButtonClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white";
      case "green":
        return "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white";
      case "red":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white";
      case "amber":
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white";
      case "purple":
        return "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white";
      default:
        return "bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 text-white";
    }
  };

  // Get icon color class
  const getIconColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-100";
      case "green":
        return "text-green-100";
      case "red":
        return "text-red-100";
      case "amber":
        return "text-amber-100";
      case "purple":
        return "text-purple-100";
      default:
        return "text-slate-100";
    }
  };

  // Get arrow color class
  const getArrowColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-200";
      case "green":
        return "text-green-200";
      case "red":
        return "text-red-200";
      case "amber":
        return "text-amber-200";
      case "purple":
        return "text-purple-200";
      default:
        return "text-slate-200";
    }
  };

  const buttonClasses = getButtonClasses(card.color);
  const iconColorClass = getIconColorClass(card.color);
  const arrowColorClass = getArrowColorClass(card.color);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Position the icon with lower z-index to ensure it stays behind text */}
      <div className="absolute right-2 sm:right-4 top-2 sm:top-4 opacity-30 pointer-events-none z-0">
        <div className={iconColorClass}>{card.icon}</div>
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
          className={`inline-flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${buttonClasses}`}
        >
          {card.buttonText}
          <span className={arrowColorClass}>→</span>
        </Link>
      </div>
    </div>
  );
}
