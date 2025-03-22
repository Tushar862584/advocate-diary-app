"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HearingFormProps {
  caseId: string;
  onSuccess?: () => void;
}

export default function CaseHearingForm({ caseId, onSuccess }: HearingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: "",
    notes: "",
    nextDate: "",
    nextPurpose: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      setError("Hearing date is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/cases/${caseId}/hearings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Hearing added successfully!");
        setFormData({
          date: "",
          notes: "",
          nextDate: "",
          nextPurpose: "",
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Refresh the page to show the updated data
        router.refresh();
      } else {
        setError(data.error || "Failed to add hearing");
      }
    } catch (err) {
      setError("An error occurred while adding the hearing");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Hearing</h2>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg border border-green-200" role="alert">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Hearing Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="nextDate" className="block text-sm font-medium text-gray-700 mb-1">
              Next Hearing Date (if known)
            </label>
            <input
              type="date"
              id="nextDate"
              name="nextDate"
              value={formData.nextDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="nextPurpose" className="block text-sm font-medium text-gray-700 mb-1">
            Purpose of Next Hearing
          </label>
          <input
            type="text"
            id="nextPurpose"
            name="nextPurpose"
            value={formData.nextPurpose}
            onChange={handleChange}
            placeholder="e.g., Evidence, Arguments, Judgment"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes on Current Hearing
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Enter details about what happened in the hearing..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Hearing"}
          </button>
        </div>
      </form>
    </div>
  );
} 