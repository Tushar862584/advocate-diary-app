"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { toast } from "sonner";

interface CaseCompletionToggleProps {
  caseId: string;
  initialStatus: boolean;
  isAdmin: boolean;
}

export default function CaseCompletionToggle({
  caseId,
  initialStatus,
  isAdmin,
}: CaseCompletionToggleProps) {
  const [isCompleted, setIsCompleted] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const toggleStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistic update for immediate UI feedback
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);

      // Use toast.promise to manage all toast notifications
      await toast.promise(
        updateCaseStatus(newStatus),
        {
          loading: 'Updating case status...',
          success: `Case marked as ${newStatus ? "Completed" : "Pending"} successfully!`,
          error: 'Failed to update case status. Please try again.'
        }
      );

      router.refresh();
    } catch (error) {
      // Revert optimistic update if failed
      setIsCompleted(isCompleted);
      console.error("Error updating case status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update case status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Separated the API call function
  const updateCaseStatus = async (newStatus: boolean) => {
    const response = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isCompleted: newStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Failed to parse error response" }));
      throw new Error(
        errorData.error || `Failed to update case status: ${response.status}`
      );
    }

    return response.json();
  };

  if (isAdmin) {
    return (
      <div className="flex items-center gap-4">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        )}

        <button
          onClick={toggleStatus}
          disabled={isLoading}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          } ${
            isCompleted
              ? "bg-green-500 hover:bg-green-600"
              : "bg-slate-400 hover:bg-slate-500"
          }`}
          aria-label={isCompleted ? "Mark as pending" : "Mark as completed"}
        >
          <span
            className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
              isCompleted ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex items-center">
        <div
          className={`px-3 py-1 rounded-full text-white text-sm font-medium transition-colors ${
            isCompleted ? "bg-green-600" : "bg-slate-600"
          }`}
        >
          <span className="flex items-center gap-1.5">
            {isCompleted ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Completed
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                Pending
              </>
            )}
          </span>
        </div>
      </div>
    );
  }
}
