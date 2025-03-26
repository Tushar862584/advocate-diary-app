"use client";

import { useState } from "react";

interface CaseTabsProps {
  caseId: string;
  hearingsComponent: React.ReactNode;
  notesComponent: React.ReactNode;
  filesComponent: React.ReactNode;
}

export default function CaseTabs({
  caseId,
  hearingsComponent,
  notesComponent,
  filesComponent,
}: CaseTabsProps) {
  const [activeTab, setActiveTab] = useState("hearings");

  // Define the tabs based on the passed components
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
              onClick={() => setActiveTab(tab.id)}
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
              >
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
}
