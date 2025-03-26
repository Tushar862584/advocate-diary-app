"use client";

import { useState, useEffect } from "react";
import { Case } from "@/types/case";
import CaseSearch, { SearchParams } from "./case-search";
import {
  Eye,
  Edit,
  Calendar,
  Plus,
  Check,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import DeleteCaseButton from "@/components/cases/delete-case-button";
import CaseAssignButton from "@/components/case/CaseAssignButton";

type StatusFilter = "all" | "pending" | "completed";

interface FilteredCasesProps {
  initialCases: Case[];
  isAdmin: boolean;
  userId: string;
}

export default function FilteredCases({
  initialCases,
  isAdmin,
  userId,
}: FilteredCasesProps) {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    field: "all",
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let filteredCases = [...initialCases];

    // First apply status filter
    if (statusFilter !== "all") {
      filteredCases = filteredCases.filter((caseItem) =>
        statusFilter === "completed"
          ? caseItem.isCompleted
          : !caseItem.isCompleted
      );
    }

    // Then apply search filter if there's a search query
    if (searchParams.query.trim()) {
      const query = searchParams.query.toLowerCase();
      filteredCases = filteredCases.filter((caseItem) => {
        // Search logic based on selected field
        switch (searchParams.field) {
          case "caseNumber":
            return `${caseItem.caseType} ${caseItem.registrationNum}/${caseItem.registrationYear}`
              .toLowerCase()
              .includes(query);
          case "title":
            return caseItem.title.toLowerCase().includes(query);
          case "parties":
            const petitioners = caseItem.petitioners
              .map((p: { name: string }) => p.name)
              .join(" ");
            const respondents = caseItem.respondents
              .map((r: { name: string }) => r.name)
              .join(" ");
            return (
              petitioners.toLowerCase().includes(query) ||
              respondents.toLowerCase().includes(query)
            );
          case "court":
            return caseItem.courtName.toLowerCase().includes(query);
          case "caseType":
            return caseItem.caseType.toLowerCase().includes(query);
          case "status":
            const statusQuery = query.toLowerCase();
            if (statusQuery.includes("complete")) {
              return caseItem.isCompleted === true;
            } else if (
              statusQuery.includes("pending") ||
              statusQuery.includes("active")
            ) {
              return caseItem.isCompleted === false;
            }
            return false;
          case "all":
          default:
            // Search all fields
            return (
              `${caseItem.caseType} ${caseItem.registrationNum}/${caseItem.registrationYear}`
                .toLowerCase()
                .includes(query) ||
              caseItem.title.toLowerCase().includes(query) ||
              caseItem.petitioners.some((p: { name: string }) =>
                p.name.toLowerCase().includes(query)
              ) ||
              caseItem.respondents.some((r: { name: string }) =>
                r.name.toLowerCase().includes(query)
              ) ||
              caseItem.courtName.toLowerCase().includes(query)
            );
        }
      });
    }

    setCases(filteredCases);
  }, [searchParams, initialCases, statusFilter]);

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

  // Get counts for status filters
  const pendingCount = initialCases.filter((c) => !c.isCompleted).length;
  const completedCount = initialCases.filter((c) => c.isCompleted).length;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">Your Cases</h1>
        {isAdmin && (
          <Link
            href="/cases/new"
            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">New Case</span>
          </Link>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex mb-4 border-b border-slate-700">
        <button
          onClick={() => setStatusFilter("all")}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            statusFilter === "all"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-slate-700 hover:text-slate-300 hover:border-slate-600"
          }`}
        >
          All Cases{" "}
          <span className="ml-1.5 bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">
            {initialCases.length}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            statusFilter === "pending"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-slate-700 hover:text-slate-300 hover:border-slate-600"
          }`}
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" /> Pending{" "}
          <span className="ml-1.5 bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            statusFilter === "completed"
              ? "border-green-500 text-green-500"
              : "border-transparent text-slate-700 hover:text-slate-300 hover:border-slate-600"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Completed{" "}
          <span className="ml-1.5 bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">
            {completedCount}
          </span>
        </button>
      </div>

      <CaseSearch onSearch={setSearchParams} />

      {cases.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-300">No cases match your search criteria.</p>
        </div>
      ) : (
        <>
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
                      className={`hover:bg-slate-700 transition-colors ${
                        caseItem.isCompleted ? "opacity-70" : ""
                      }`}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-blue-400 truncate">
                            {caseItem.caseType}
                          </span>
                          <span className="text-sm text-slate-400 truncate">
                            #{caseItem.registrationNum}/
                            {caseItem.registrationYear}
                          </span>
                          {caseItem.isCompleted && (
                            <span className="text-xs text-green-400 mt-1">
                              <Check className="h-3 w-3 inline mr-1" />
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-200 line-clamp-1">
                            {caseItem.title}
                          </span>
                          <div className="text-xs text-slate-400 mt-1">
                            <span className="line-clamp-1">
                              {caseItem.petitioners
                                .map((p: { name: string }) => p.name)
                                .join(", ")}{" "}
                              vs{" "}
                              {caseItem.respondents
                                .map((r: { name: string }) => r.name)
                                .join(", ")}
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
                          {isAdmin && (
                            <Link
                              href={`/cases/${caseItem.id}/edit`}
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-transparent hover:border-amber-600"
                              title="Edit Case"
                              prefetch={false}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          {isAdmin && (
                            <CaseAssignButton
                              caseId={caseItem.id}
                              isAssigned={Boolean(caseItem.userId)}
                            />
                          )}
                          {isAdmin && (
                            <DeleteCaseButton
                              caseId={caseItem.id}
                              isOwner={caseItem.userId === userId || isAdmin}
                            />
                          )}
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
                        {caseItem.petitioners
                          .map((p: { name: string }) => p.name)
                          .join(", ")}{" "}
                        vs{" "}
                        {caseItem.respondents
                          .map((r: { name: string }) => r.name)
                          .join(", ")}
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

                    {isAdmin && (
                      <Link
                        href={`/cases/${caseItem.id}/edit`}
                        className="flex justify-center items-center py-2 rounded-md text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-slate-700"
                        prefetch={false}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="text-xs">Edit</span>
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {isAdmin && (
                      <>
                        <CaseAssignButton
                          caseId={caseItem.id}
                          isAssigned={Boolean(caseItem.userId)}
                        />
                        <DeleteCaseButton
                          caseId={caseItem.id}
                          isOwner={caseItem.userId === userId || isAdmin}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
