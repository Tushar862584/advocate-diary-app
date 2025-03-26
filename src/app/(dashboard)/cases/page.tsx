import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import FilteredCases from "@/components/cases/filtered-cases";
import { Case } from "@/types/case";

export default async function CasesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.role === "ADMIN";

  // Get cases:
  // - Admins see all cases, including unassigned ones
  // - Regular users see only their cases
  const cases = await prisma.case.findMany({
    where: isAdmin ? {} : { userId: session.user?.id },
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
    <div className="cases-page">
      <FilteredCases 
        initialCases={cases as Case[]} 
        isAdmin={isAdmin} 
        userId={session.user.id} 
      />
    </div>
  );
}
