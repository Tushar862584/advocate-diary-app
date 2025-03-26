"use client";

import { useState, useEffect } from "react";

interface CaseTabsProps {
  caseId: string;
  hearingsComponent: React.ReactNode;
  notesComponent: React.ReactNode;
  filesComponent: React.ReactNode;
  assignmentComponent?: React.ReactNode;
}

export default function CaseTabs({
  caseId,
  hearingsComponent,
  notesComponent,
  filesComponent,
  assignmentComponent,
}: CaseTabsProps) {
  const [activeTab, setActiveTab] = useState("hearings");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#hearings") setActiveTab("hearings");
      if (hash === "#notes") setActiveTab("notes");
      if (hash === "#documents") setActiveTab("documents");
      if (hash === "#assignment" && assignmentComponent) setActiveTab("assignment");
    }
  }, [assignmentComponent]);

  const handleTabChange = (tabId: string) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}#${tabId}`);
    }
    setActiveTab(tabId);
  };

  const tabs = [
    {
      id: "hearings",
      label: "Hearings",
      content: hearingsComponent,
    },
    {
      id: "notes",
      label: "Notes",
      content: notesComponent,
    },
    {
      id: "documents",
      label: "Documents",
      content: filesComponent,
    },
  ];

  if (assignmentComponent) {
    tabs.push({
      id: "assignment",
      label: "Assignment",
      content: assignmentComponent,
    });
  }

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav
          className="flex -mb-px space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">
        {tabs.map(
          (tab) =>
            tab.content && (
              <div
                key={`content-${tab.id}`}
                className={`${activeTab === tab.id ? "block" : "hidden"}`}
                id={tab.id}
              >
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
}
