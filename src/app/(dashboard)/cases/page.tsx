import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import FilteredCases from "@/components/cases/filtered-cases";
import { Case } from "@/types/case";
import Link from "next/link";
import { PlusCircle } from "lucide-react"; // Import the icon

export default async function CasesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.role === "ADMIN";

  // Get cases:
  // - Admins see all non-PERSONAL cases
  // - Regular users see only their cases (including PERSONAL)
  const cases = await prisma.case.findMany({
    where: isAdmin
      ? { caseType: { not: "PERSONAL" } } // Exclude PERSONAL cases for admins
      : { userId: session.user?.id }, // Users see all their own cases
    select: {
      id: true,
      caseType: true,
      registrationYear: true,
      registrationNum: true,
      title: true,
      courtName: true,
      userId: true,
      updatedAt: true,
      isCompleted: true,
      petitioners: {
        select: {
          name: true,
        },
        take: 1,
      },
      respondents: {
        select: {
          name: true,
        },
        take: 1,
      },
      hearings: {
        select: {
          date: true,
          nextDate: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 1,
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="w-full max-w-full overflow-hidden">
      {isAdmin && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-800 px-5">
            Manage Cases
          </h2>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Case</span>
          </Link>
        </div>
      )}
      <FilteredCases
        initialCases={cases as Case[]}
        isAdmin={isAdmin}
        userId={session.user?.id || ""}
      />
    </div>
  );
}
