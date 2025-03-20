import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CasesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.role === "ADMIN";
  
  // Get cases (admins see all, regular users see only their cases)
  const cases = await prisma.case.findMany({
    where: isAdmin ? {} : { userId: session.user?.id },
    select: {
      id: true,
      caseType: true,
      registrationYear: true,
      registrationNum: true,
      title: true,
      courtName: true,
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
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cases</h1>
        <Link
          href="/cases/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add New Case
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                S.No
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Case Type & Number
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Petitioner
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Respondent
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Next Hearing
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                  No cases found. Add a new case to get started.
                </td>
              </tr>
            ) : (
              cases.map((caseItem, index) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                    {caseItem.caseType}/{caseItem.registrationNum}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                    {caseItem.petitioners[0]?.name || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                    {caseItem.respondents[0]?.name || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                    {caseItem.hearings[0]?.nextDate
                      ? new Date(caseItem.hearings[0].nextDate).toLocaleDateString()
                      : "Not scheduled"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <Link
                      href={`/cases/${caseItem.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 