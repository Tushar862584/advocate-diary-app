import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DeleteCaseButton from "@/components/cases/delete-case-button";
import CaseAssignButton from "@/components/case/CaseAssignButton";
import { Eye, Edit, Plus, Calendar } from "lucide-react";

// Define types for the case objects
interface Case {
  id: string;
  caseType: string;
  registrationYear: number;
  registrationNum: number;
  title: string;
  courtName: string;
  userId: string | null;
  updatedAt?: Date;
  petitioners: Array<{ name: string }>;
  respondents: Array<{ name: string }>;
  hearings: Array<{ date: Date; nextDate: Date | null }>;
  user?: {
    name: string;
    id: string;
  } | null;
}

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

  // Format the next hearing date if available
  const getNextHearingDate = (caseItem: Case) => {
    if (
      caseItem.hearings &&
      caseItem.hearings.length > 0 &&
      caseItem.hearings[0].nextDate
    ) {
      const nextDate = new Date(caseItem.hearings[0].nextDate);
      return nextDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return "Not scheduled";
  };

  return (
    <div className="cases-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Your Cases</h1>
        <Link
          href="/cases/new"
          className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />{" "}
          <span className="hidden sm:inline">New Case</span>
        </Link>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="overflow-hidden rounded-lg border border-slate-700 shadow-md bg-slate-800">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300 w-[18%]"
                >
                  Case Number
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300 w-[42%]"
                >
                  Title & Parties
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300 w-[15%]"
                >
                  Court
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300 hidden md:table-cell w-[15%]"
                >
                  Next Hearing
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-300 w-[10%]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-800">
              {cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  className="hover:bg-slate-700 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-400 truncate">
                        {caseItem.caseType}
                      </span>
                      <span className="text-sm text-slate-400 truncate">
                        #{caseItem.registrationNum}/{caseItem.registrationYear}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 line-clamp-1">
                        {caseItem.title}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">
                        <span className="line-clamp-1">
                          {caseItem.petitioners.map((p) => p.name).join(", ")}{" "}
                          vs{" "}
                          {caseItem.respondents.map((r) => r.name).join(", ")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 align-top truncate">
                    {caseItem.courtName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 hidden md:table-cell align-top">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {getNextHearingDate(caseItem)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/cases/${caseItem.id}`}
                        className="inline-flex items-center justify-center rounded-md p-1.5 text-blue-400 hover:bg-slate-700 hover:text-blue-300 border border-transparent hover:border-blue-600"
                        title="View Case"
                        prefetch={false}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/cases/${caseItem.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md p-1.5 text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-transparent hover:border-amber-600"
                        title="Edit Case"
                        prefetch={false}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {isAdmin && (
                        <CaseAssignButton
                          caseId={caseItem.id}
                          isAssigned={Boolean(caseItem.userId)}
                        />
                      )}
                      <DeleteCaseButton
                        caseId={caseItem.id}
                        isOwner={
                          caseItem.userId === session.user?.id || isAdmin
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Layout - Card View Only */}
      <div className="space-y-3 sm:hidden">
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-3 border-b border-slate-700">
              <div>
                <h3 className="font-medium text-blue-400 flex items-center text-sm">
                  <span className="truncate">{caseItem.caseType}</span>
                  <span className="ml-1 text-xs text-slate-400 whitespace-nowrap">
                    #{caseItem.registrationNum}/{caseItem.registrationYear}
                  </span>
                </h3>
                <p className="text-sm text-slate-200 mt-1.5 line-clamp-2">
                  {caseItem.title}
                </p>
              </div>

              <div className="text-xs text-slate-400 mt-2">
                <div className="flex items-start">
                  <span className="font-medium mr-1 whitespace-nowrap">
                    Court:
                  </span>
                  <span className="line-clamp-1">{caseItem.courtName}</span>
                </div>
                <div className="flex items-start mt-1">
                  <span className="font-medium mr-1 whitespace-nowrap">
                    Parties:
                  </span>
                  <span className="line-clamp-1">
                    {caseItem.petitioners.map((p) => p.name).join(", ")} vs{" "}
                    {caseItem.respondents.map((r) => r.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 p-2 gap-2">
              <div className="grid grid-cols-2 gap-1">
                <Link
                  href={`/cases/${caseItem.id}`}
                  className="flex justify-center items-center py-2 rounded-md text-blue-400 hover:bg-slate-700 hover:text-blue-300 border border-slate-700"
                  prefetch={false}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="text-xs">View</span>
                </Link>

                <Link
                  href={`/cases/${caseItem.id}/edit`}
                  className="flex justify-center items-center py-2 rounded-md text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-slate-700"
                  prefetch={false}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span className="text-xs">Edit</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-1">
                {isAdmin ? (
                  <>
                    <CaseAssignButton
                      caseId={caseItem.id}
                      isAssigned={Boolean(caseItem.userId)}
                    />
                    <DeleteCaseButton
                      caseId={caseItem.id}
                      isOwner={caseItem.userId === session.user?.id || isAdmin}
                    />
                  </>
                ) : (
                  <div className="col-span-2">
                    <DeleteCaseButton
                      caseId={caseItem.id}
                      isOwner={caseItem.userId === session.user?.id || isAdmin}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
