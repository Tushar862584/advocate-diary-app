"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Hearing {
  id: string;
  date: Date;
  notes?: string | null;
  nextDate?: Date | null;
  nextPurpose?: string | null;
}

interface CaseHearingsProps {
  caseId: string;
  hearings: Hearing[];
}

export function CaseHearings({ caseId, hearings }: CaseHearingsProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    notes: "",
    nextDate: "",
    nextPurpose: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/hearings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add hearing");
      }

      setIsAdding(false);
      setFormData({
        date: "",
        notes: "",
        nextDate: "",
        nextPurpose: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error adding hearing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Court Hearings</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Hearing
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-300"
                >
                  Hearing Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="nextDate"
                  className="block text-sm font-medium text-slate-300"
                >
                  Next Hearing Date
                </label>
                <input
                  id="nextDate"
                  name="nextDate"
                  type="date"
                  value={formData.nextDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-slate-300"
                >
                  Hearing Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200"
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="nextPurpose"
                  className="block text-sm font-medium text-slate-300"
                >
                  Next Hearing Purpose
                </label>
                <textarea
                  id="nextPurpose"
                  name="nextPurpose"
                  value={formData.nextPurpose}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-md border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.date}
                className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Hearing"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {hearings.length === 0 ? (
          <p className="text-sm text-slate-400">No hearings recorded yet.</p>
        ) : (
          hearings.map((hearing) => (
            <div key={hearing.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Hearing Date</p>
                  <p className="font-medium text-slate-200">
                    {new Date(hearing.date).toLocaleDateString()}
                  </p>
                  {hearing.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">Notes</p>
                      <p className="text-slate-200">{hearing.notes}</p>
                    </div>
                  )}
                </div>
                <div>
                  {hearing.nextDate && (
                    <>
                      <p className="text-sm text-slate-400">Next Hearing Date</p>
                      <p className="font-medium text-slate-200">
                        {new Date(hearing.nextDate).toLocaleDateString()}
                      </p>
                    </>
                  )}
                  {hearing.nextPurpose && (
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">Next Hearing Purpose</p>
                      <p className="text-slate-200">{hearing.nextPurpose}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 