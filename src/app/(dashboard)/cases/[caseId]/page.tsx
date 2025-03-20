import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { CaseNotes } from "@/components/cases/case-notes";
import { CaseHearings } from "@/components/cases/case-hearings";
import { CaseFiles } from "@/components/cases/case-files";

export default async function CaseDetailPage({
  params,
}: {
  params: { caseId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const {caseId} = await params;
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

  // Check if case exists and user has permission to view
  if (!caseDetail || (!isAdmin && caseDetail.userId !== session.user?.id)) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/cases" className="text-sm text-blue-600 hover:underline">
              ← Back to Cases
            </Link>
            <h1 className="mt-2 text-2xl font-bold">
              {caseDetail.caseType}/{caseDetail.registrationNum} - {caseDetail.title}
            </h1>
          </div>
          
          <div>
            <Link
              href={`/cases/${caseId}/edit`}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Edit Case
            </Link>
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
              <p>{caseDetail.registrationYear}/{caseDetail.registrationNum}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Court</p>
              <p>{caseDetail.courtName}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Filed By</p>
              <p>{caseDetail.user.name}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Petitioners</p>
              <ul className="list-inside list-disc">
                {caseDetail.petitioners.map((petitioner) => (
                  <li key={petitioner.id}>{petitioner.name}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Respondents</p>
              <ul className="list-inside list-disc">
                {caseDetail.respondents.map((respondent) => (
                  <li key={respondent.id}>{respondent.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          <a href={`#hearings`} className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
            Hearings
          </a>
          <a href={`#notes`} className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Notes
          </a>
          <a href={`#files`} className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Files
          </a>
        </nav>
      </div>

      {/* Hearings Section */}
      <div id="hearings" className="mb-8">
        <CaseHearings caseId={caseId} hearings={caseDetail.hearings} />
      </div>
      
      {/* Notes Section */}
      <div id="notes" className="mb-8">
        <CaseNotes caseId={caseId} notes={caseDetail.notes} />
      </div>
      
      {/* Files Section */}
      <div id="files">
        <CaseFiles caseId={caseId} files={caseDetail.uploads} />
      </div>
    </div>
  );
} 