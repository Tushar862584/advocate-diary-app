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
  filesComponent 
}: CaseTabsProps) {
  const [activeTab, setActiveTab] = useState<'hearings' | 'notes' | 'files'>('hearings');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-300">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('hearings')}
            className={`${
              activeTab === 'hearings'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } py-4 px-1 text-sm font-medium transition-colors duration-200`}
          >
            Hearings
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`${
              activeTab === 'notes'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } py-4 px-1 text-sm font-medium transition-colors duration-200`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`${
              activeTab === 'files'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } py-4 px-1 text-sm font-medium transition-colors duration-200`}
          >
            Files
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'hearings' && hearingsComponent}
        {activeTab === 'notes' && notesComponent}
        {activeTab === 'files' && filesComponent}
      </div>
    </div>
  );
} 