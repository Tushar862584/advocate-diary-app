"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCaseButtonProps {
  caseId: string;
  isOwner: boolean;
}

export default function DeleteCaseButton({ caseId, isOwner }: DeleteCaseButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    // Don't close the dialog while deleting is in progress
    if (isDeleting && !open) return;
    
    setDialogOpen(open);
    
    // Reset deleting state when dialog closes
    if (!open && isDeleting) {
      setIsDeleting(false);
    }
  }, [isDeleting]);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    // Use toast.promise to handle the loading, success, and error states
    toast.promise(
      deleteCase(),
      {
        loading: 'Deleting case...',
        success: 'Case deleted successfully',
        error: (err) => `Failed to delete case: ${err.message || 'Please try again'}`,
      }
    );
    
    async function deleteCase() {
      try {
        const response = await fetch(`/api/cases/${caseId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete case");
        }

        // Close dialog and navigate back to cases list
        setDialogOpen(false);
        router.push("/cases");
        router.refresh();
        
        return true; // Resolve the promise successfully
      } catch (error) {
        console.error("Error deleting case:", error);
        setIsDeleting(false);
        throw error; // Reject the promise with the error
      }
    }
  }, [caseId, router, isDeleting]);

  if (!isOwner) return null;
  
  // Check if we're in mobile view by looking at the parent element's classes
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
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
      
      <AlertDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}