"use client";

import { useState } from "react";
import CaseHearingForm from "./CaseHearingForm";

interface Hearing {
  id: string;
  date: string;
  notes: string | null;
  nextDate: string | null;
  nextPurpose: string | null;
  createdAt: string;
  updatedAt: string;
  caseId: string;
}

interface CaseHearingsProps {
  caseId: string;
  hearings: Hearing[];
  canEdit: boolean;
}

export default function CaseHearings({ caseId, hearings, canEdit }: CaseHearingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Hearings</h2>
        {canEdit && !showAddForm && (
          <button
            onClick={toggleAddForm}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Add Hearing
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6">
          <CaseHearingForm 
            caseId={caseId} 
            onSuccess={() => setShowAddForm(false)} 
          />
          <button
            onClick={toggleAddForm}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {hearings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center text-gray-500">
          No hearings recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {hearings.map((hearing) => (
            <div key={hearing.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hearing Date</h3>
                  <p className="text-gray-900">{formatDate(hearing.date)}</p>
                </div>
                
                {hearing.nextDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Next Hearing Date</h3>
                    <p className="text-gray-900">{formatDate(hearing.nextDate)}</p>
                  </div>
                )}
              </div>
              
              {hearing.nextPurpose && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Purpose of Next Hearing</h3>
                  <p className="text-gray-900">{hearing.nextPurpose}</p>
                </div>
              )}
              
              {hearing.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="text-gray-900 whitespace-pre-line">{hearing.notes}</p>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-400">
                Added on {formatDate(hearing.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 