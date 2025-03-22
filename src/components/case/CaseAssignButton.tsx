"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

interface CaseAssignButtonProps {
  caseId: string;
  isAssigned: boolean;
}

export default function CaseAssignButton({ caseId, isAssigned }: CaseAssignButtonProps) {
  // Check if we're in mobile view by looking at the screen width
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  
  return (
    <Link
      href={`/cases/${caseId}#assignment`}
      className={isMobileView 
        ? "flex-1 flex justify-center items-center py-2 rounded-md text-purple-400 hover:bg-slate-700 hover:text-purple-300 border border-slate-700"
        : "inline-flex items-center justify-center rounded-md p-1.5 text-purple-400 hover:bg-slate-700 hover:text-purple-300 border border-transparent hover:border-purple-600"
      }
      title={isAssigned ? "Reassign Case" : "Assign Case"}
      aria-label={isAssigned ? "Reassign Case" : "Assign Case"}
      prefetch={false}
    >
      <UserPlus className="h-4 w-4" />
      {isMobileView && <span className="text-xs ml-1">Assign</span>}
    </Link>
  );
} 