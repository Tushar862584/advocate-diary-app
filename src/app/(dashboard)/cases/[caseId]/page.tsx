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
import ShareButtons from "@/components/ShareButtons";
import CasePrintButton from "@/components/CasePrintButton";
import CaseCompletionToggle from "@/components/case/CaseCompletionToggle";

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
    <div className="bg-slate-50">
      <div className="mb-6">
        <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <Link
              href="/cases"
              className="text-sm text-blue-700 hover:underline flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Cases
            </Link>

            {/* Separate heading and status toggle for better mobile layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mt-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                {caseDetail.caseType}/{caseDetail.registrationNum} -{" "}
                {caseDetail.title}
              </h1>

              {/* Show completion status to all users, but only admins can toggle */}
              <div className="self-start sm:self-auto">
                <CaseCompletionToggle
                  caseId={caseId}
                  initialStatus={Boolean(caseDetail.isCompleted)}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          </div>

          {/* Action buttons moved below the title */}
          <div className="flex flex-wrap gap-2">
            {/* Share button - available to all users */}
            <ShareButtons
              caseDetail={{
                title: caseDetail.title,
                caseType: caseDetail.caseType,
                registrationNum: String(caseDetail.registrationNum),
                registrationYear: String(caseDetail.registrationYear),
                currentHearing:
                  formattedHearings.length > 0
                    ? new Date(formattedHearings[0].date)
                    : null,
                currentNotes:
                  formattedHearings.length > 0 && formattedHearings[0].notes
                    ? formattedHearings[0].notes
                    : null,
                nextHearing:
                  formattedHearings.length > 0 && formattedHearings[0].nextDate
                    ? new Date(formattedHearings[0].nextDate)
                    : null,
                nextPurpose:
                  formattedHearings.length > 0 &&
                  formattedHearings[0].nextPurpose
                    ? formattedHearings[0].nextPurpose
                    : null,
              }}
            />

            {/* Print button - available to all users */}
            <CasePrintButton
              caseDetail={{
                caseType: caseDetail.caseType,
                registrationYear: caseDetail.registrationYear,
                registrationNum: caseDetail.registrationNum,
                title: caseDetail.title,
                courtName: caseDetail.courtName,
                isCompleted: caseDetail.isCompleted,
                user: caseDetail.user,
                notes: caseDetail.notes.map((note) => ({
                  id: note.id,
                  content: note.content,
                  createdAt: note.createdAt,
                  user: note.user ? { name: note.user.name } : null,
                })),
                uploads: caseDetail.uploads.map((file) => ({
                  id: file.id,
                  fileName: file.fileName,
                  fileUrl: file.fileUrl,
                  fileType: file.fileType,
                  createdAt: file.createdAt,
                })),
              }}
              formattedHearings={formattedHearings}
              petitioners={petitioners}
              respondents={respondents}
            />

            {/* Edit button - only visible to admins */}
            {isAdmin && (
              <Link
                href={`/cases/${caseId}/edit`}
                className="inline-flex items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-1 xs:mr-2"
                >
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
                <span className="hidden xs:inline">Edit Case</span>
                <span className="xs:hidden">Edit</span>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Case Details
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Case Type
              </p>
              <p className="text-slate-800">{caseDetail.caseType}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Registration Number
              </p>
              <p className="text-slate-800">
                {caseDetail.registrationYear}/{caseDetail.registrationNum}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-sm font-medium text-slate-500 mb-1">Court</p>
              <p className="text-slate-800">{caseDetail.courtName}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Filed By
              </p>
              <p className="text-slate-800">
                {caseDetail.user?.name || "Not assigned"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-slate-50 p-4 rounded-md">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Petitioners
              </p>
              <ul className="space-y-2">
                {petitioners.map((petitioner) => (
                  <li key={petitioner.id} className="flex items-baseline">
                    <span className="text-blue-700 mr-2">•</span>
                    <div>
                      <span className="text-slate-800 font-medium">
                        {petitioner.name}
                      </span>
                      {petitioner.advocate && (
                        <span className="block text-sm text-slate-500 mt-0.5">
                          Advocate: {petitioner.advocate}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-md">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Respondents
              </p>
              <ul className="space-y-2">
                {respondents.map((respondent) => (
                  <li key={respondent.id} className="flex items-baseline">
                    <span className="text-blue-700 mr-2">•</span>
                    <div>
                      <span className="text-slate-800 font-medium">
                        {respondent.name}
                      </span>
                      {respondent.advocate && (
                        <span className="block text-sm text-slate-500 mt-0.5">
                          Advocate: {respondent.advocate}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2">
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
              currentUserId={session.user?.id || ""}
            />
          }
          assignmentComponent={
            isAdmin ? (
              <CaseAssignment
                caseId={caseId}
                currentUserId={caseDetail.userId}
                currentUserName={caseDetail.user?.name || null}
                isAdmin={isAdmin}
              />
            ) : null
          }
        />
      </div>
    </div>
  );
}
