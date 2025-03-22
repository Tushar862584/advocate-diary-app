"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteCaseButtonProps {
  caseId: string;
  isOwner: boolean;
}

export default function DeleteCaseButton({ caseId, isOwner }: DeleteCaseButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openDeleteConfirm = () => {
    setShowConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowConfirm(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete case");
      }

      // Navigate back to cases list after successful deletion
      setShowConfirm(false);
      router.push("/cases");
      router.refresh();
    } catch (error) {
      console.error("Error deleting case:", error);
      alert("Failed to delete case. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOwner) return null;
  
  // Check if we're in mobile view by looking at the parent element's classes
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <>
      <button
        onClick={openDeleteConfirm}
        disabled={isDeleting}
        className={isMobileView 
          ? "flex-1 flex justify-center items-center py-2 rounded-md text-red-400 hover:bg-slate-700 hover:text-red-300 border border-slate-700"
          : "inline-flex items-center justify-center rounded-md p-1.5 text-red-400 hover:bg-slate-700 hover:text-red-300 border border-transparent hover:border-red-600"
        }
        title="Delete Case"
      >
        <Trash2 className="h-4 w-4" />
        {isMobileView && <span className="text-xs ml-1">Delete</span>}
      </button>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-700">
            <h3 className="text-lg font-medium text-slate-100 mb-4">Delete Case</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this case? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 border border-slate-600 rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}