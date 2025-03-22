import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import EditCaseForm from "./edit-case-form";

export default async function EditCasePage({
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

  return (
    <div>
      <div className="mb-6">
        <Link href={`/cases/${caseId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Case
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit Case</h1>
      </div>
      
      <div className="rounded-lg border bg-white p-6">
        <EditCaseForm 
          caseDetail={caseDetail} 
          petitioners={caseDetail.petitioners} 
          respondents={caseDetail.respondents} 
        />
      </div>
    </div>
  );
} 