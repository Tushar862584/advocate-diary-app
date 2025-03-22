import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { CaseNotes } from "@/components/cases/case-notes";
import CaseHearings from "@/components/case/CaseHearings";
import { CaseFiles } from "@/components/cases/case-files";
import CaseTabs from "@/components/case/CaseTabs";
import CaseAssignment from "@/components/case/CaseAssignment";

// Define the structure for petitioner and respondent objects
interface Petitioner {
  id: string;
  name: string;
  advocate?: string | null;
  caseId: string;
}

interface Respondent {
  id: string;
  name: string;
  advocate?: string | null;
  caseId: string;
}

export default async function CaseDetailPage({
  params,
}: {
  params: { caseId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Properly await the params to fix Next.js error
  const { caseId } = await Promise.resolve(params);
  const isAdmin = session.user?.role === "ADMIN";

  // Fetch case with details
  const caseDetail = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      petitioners: true,
      respondents: true,
      hearings: {
        orderBy: { date: "desc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
      uploads: {
        orderBy: { createdAt: "desc" },
      },
      user: true,
    },
  });

  // Check if case exists
  if (!caseDetail) {
    notFound();
  }

  // Check if user is owner
  const isOwner = caseDetail.userId === session.user?.id;

  // Only allow access if user is admin or owner
  if (!isAdmin && !isOwner) {
    notFound();
  }

  // Safely access the petitioners and respondents with proper typing
  const petitioners = caseDetail.petitioners as Petitioner[];
  const respondents = caseDetail.respondents as Respondent[];

  // Format hearings data for the component
  const formattedHearings = caseDetail.hearings.map((h) => ({
    id: h.id,
    date: h.date.toISOString(),
    notes: h.notes,
    nextDate: h.nextDate ? h.nextDate.toISOString() : null,
    nextPurpose: h.nextPurpose,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
    caseId: h.caseId,
  }));

  // Determine if the user can edit content based on their role
  const canEdit = isAdmin || isOwner;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/cases"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Cases
            </Link>
            <h1 className="mt-2 text-2xl font-bold">
              {caseDetail.caseType}/{caseDetail.registrationNum} -{" "}
              {caseDetail.title}
            </h1>
          </div>

          <div>
            {(isAdmin || isOwner) && (
              <Link
                href={`/cases/${caseId}/edit`}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Edit Case
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-bold">Case Details</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Case Type</p>
              <p>{caseDetail.caseType}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Registration Number</p>
              <p>
                {caseDetail.registrationYear}/{caseDetail.registrationNum}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Court</p>
              <p>{caseDetail.courtName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Filed By</p>
              <p>{caseDetail.user?.name || "Not assigned"}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Petitioners</p>
              <ul className="list-inside list-disc">
                {petitioners.map((petitioner) => (
                  <li key={petitioner.id}>
                    {petitioner.name}
                    {petitioner.advocate && (
                      <span className="text-sm text-gray-500">
                        {" "}
                        (Adv: {petitioner.advocate})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm text-gray-500">Respondents</p>
              <ul className="list-inside list-disc">
                {respondents.map((respondent) => (
                  <li key={respondent.id}>
                    {respondent.name}
                    {respondent.advocate && (
                      <span className="text-sm text-gray-500">
                        {" "}
                        (Adv: {respondent.advocate})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Case Assignment Section - Only visible to admins */}
      {isAdmin && (
        <CaseAssignment
          caseId={caseId}
          currentUserId={caseDetail.userId}
          currentUserName={caseDetail.user?.name || null}
          isAdmin={isAdmin}
        />
      )}

      {/* Replace the old tabs and sections with the new CaseTabs component */}
      <CaseTabs
        caseId={caseId}
        hearingsComponent={
          <CaseHearings
            caseId={caseId}
            hearings={formattedHearings}
            canEdit={canEdit}
          />
        }
        notesComponent={
          <CaseNotes
            caseId={caseId}
            notes={caseDetail.notes}
            canAdd={canEdit}
          />
        }
        filesComponent={
          <CaseFiles
            caseId={caseId}
            files={caseDetail.uploads}
            canUpload={canEdit}
          />
        }
      />
    </div>
  );
}
