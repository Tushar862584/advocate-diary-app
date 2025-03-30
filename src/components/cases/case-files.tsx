"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  groupByDate,
  formatDateHeading,
  sortDatesDescending,
  formatRelativeTime,
} from "@/lib/date-utils";
import { SearchBar } from "@/components/search-bar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: Date;
  userId?: string;
  user?: {
    id: string;
    name: string;
  };
}

interface CaseFilesProps {
  caseId: string;
  files: Upload[];
  canUpload?: boolean;
  currentUserId?: string;
}

export function CaseFiles({
  caseId,
  files,
  canUpload = true,
  currentUserId,
}: CaseFilesProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupByDateEnabled, setGroupByDateEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Add new state for rename functionality
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<Upload | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canUpload) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    toast.promise(
      uploadFile(),
      {
        loading: 'Uploading file...',
        success: 'File uploaded successfully',
        error: (err) => `Upload failed: ${err.message || 'Please try again'}`,
      }
    );

    async function uploadFile() {
      try {
        const response = await fetch(`/api/cases/${caseId}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Error uploading file");
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh the page to show the new file
        router.refresh();
        setLoading(false);
        
        return true; // Resolve the promise successfully
      } catch (error) {
        console.error("Error uploading file:", error);
        setError(error instanceof Error ? error.message : "Error uploading file");
        setLoading(false);
        throw error; // Reject the promise with the error
      }
    }
  };

  const handleDialogOpenChange = React.useCallback((open: boolean) => {
    // Don't close the dialog while deletion is in progress
    if (deleteLoading && !open) return;
    
    setDeleteDialogOpen(open);
    
    if (!open) {
      setFileToDelete(null);
      setDeleteLoading(false);
      setError(null);
    }
  }, [deleteLoading]);

  const handleDelete = React.useCallback((fileId: string) => {
    if (!canUpload) return; // Only allow deletion if user can upload
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  }, [canUpload]);

  const confirmDelete = React.useCallback(async () => {
    if (!fileToDelete || !canUpload) return;

    setDeleteLoading(true);
    
    toast.promise(
      deleteFile(),
      {
        loading: 'Deleting file...',
        success: 'File deleted successfully',
        error: (err) => `Deletion failed: ${err.message || 'Please try again'}`,
      }
    );

    async function deleteFile() {
      try {
        const response = await fetch(`/api/uploads/${fileToDelete}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Server error:", result);
          throw new Error(result.error || "Failed to delete file");
        }

        // Close dialog and refresh page
        router.refresh();
        setDeleteDialogOpen(false);
        
        return true; // Resolve the promise successfully
      } catch (error) {
        console.error("Error deleting file:", error);
        setError(error instanceof Error ? error.message : "Error deleting file");
        setDeleteLoading(false);
        throw error; // Reject the promise with the error
      }
    }
  }, [fileToDelete, canUpload, router]);

  const cancelDelete = React.useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Filter files based on search query
  const filteredFiles = files.filter(
    (file) =>
      !searchQuery ||
      file.fileName.toLowerCase().includes(searchQuery) ||
      file.fileType.toLowerCase().includes(searchQuery)
  );

  // Helper function to get proper file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    return "📎";
  };

  const handleRename = React.useCallback((file: Upload) => {
    if (!canUpload) return; // Only allow rename if user can upload
    setFileToRename(file);
    setNewFileName(file.fileName);
    setRenameDialogOpen(true);
  }, [canUpload]);

  const confirmRename = React.useCallback(async () => {
    if (!fileToRename || !canUpload || !newFileName.trim()) return;

    setRenameLoading(true);
    
    toast.promise(
      renameFile(),
      {
        loading: 'Renaming file...',
        success: 'File renamed successfully',
        error: (err) => `Rename failed: ${err.message || 'Please try again'}`,
      }
    );

    async function renameFile() {
      try {
        const response = await fetch(`/api/uploads/${fileToRename.id}/rename`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName: newFileName.trim() }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Server error:", result);
          throw new Error(result.error || "Failed to rename file");
        }

        // Close dialog and refresh page
        router.refresh();
        setRenameDialogOpen(false);
        
        return true; // Resolve the promise successfully
      } catch (error) {
        console.error("Error renaming file:", error);
        setError(error instanceof Error ? error.message : "Error renaming file");
        setRenameLoading(false);
        throw error; // Reject the promise with the error
      }
    }
  }, [fileToRename, canUpload, router, newFileName]);

  const cancelRename = React.useCallback(() => {
    setRenameDialogOpen(false);
    setFileToRename(null);
    setNewFileName("");
    setError(null);
  }, []);

  // Render individual file item
  const renderFileItem = (file: Upload) => {
    const fileIcon = getFileIcon(file.fileType);

    return (
      <li
        key={file.id}
        className="border border-gray-400 rounded-lg p-4 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow ease-in-out duration-200 group relative"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 text-gray-600 dark:text-gray-400">
            {fileIcon}
          </div>
          <div className="flex-grow">
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-800 hover:underline dark:text-blue-400"
            >
              {file.fileName}
            </a>
            <div className="flex items-center mt-1 text-sm text-gray-700 dark:text-gray-400">
              <span>{formatRelativeTime(file.createdAt)}</span>
            </div>
          </div>

          {canUpload && (
            <div className="flex items-center ml-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRename(file);
                }}
                className="p-1.5 rounded-full bg-gray-300 text-gray-700 hover:text-blue-600 hover:bg-blue-100 opacity-100 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity mr-1 flex-shrink-0 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-blue-400"
                title="Rename file"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(file.id);
                }}
                className="p-1.5 rounded-full bg-gray-300 text-gray-700 hover:text-red-600 hover:bg-red-100 opacity-100 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900 dark:hover:text-red-400"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </li>
    );
  };

  // Render files based on grouping preference
  const renderFiles = () => {
    if (filteredFiles.length === 0) {
      if (searchQuery) {
        return (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No files match your search query.
          </p>
        );
      }
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No files uploaded yet.
        </p>
      );
    }

    if (!groupByDateEnabled) {
      return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => renderFileItem(file))}
        </ul>
      );
    }

    // Group files by date
    const groupedFiles = groupByDate(filteredFiles, "createdAt");
    const sortedDates = sortDatesDescending(Object.keys(groupedFiles));

    return sortedDates.map((dateKey) => (
      <div key={dateKey} className="mb-5">
        <h3 className="mb-2 px-3 py-1.5 text-sm font-medium text-gray-100 bg-slate-900 rounded dark:text-gray-200 dark:bg-slate-800">
          {formatDateHeading(dateKey)}
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-0 sm:pl-2">
          {groupedFiles[dateKey].map((file) => renderFileItem(file))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Case Files & Documents
        </h2>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 text-sm font-medium text-gray-800 dark:text-gray-300">
              Group by date
            </span>
            <div
              className={`relative inline-block w-10 h-5 rounded-full transition-colors ${
                groupByDateEnabled
                  ? "bg-blue-700"
                  : "bg-gray-500 dark:bg-gray-600"
              }`}
            >
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={groupByDateEnabled}
                onChange={() => setGroupByDateEnabled(!groupByDateEnabled)}
              />
              <span
                className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition-transform ${
                  groupByDateEnabled ? "transform translate-x-5" : ""
                }`}
              ></span>
            </div>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search files..." />
      </div>

      {/* Update upload section with darker background */}
      {canUpload && (
        <div className="mb-6 rounded-lg border border-gray-400 bg-gray-200 p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4">
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2"
            >
              Upload File (PDF, Images)
            </label>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={loading}
              className="block w-full text-sm border border-gray-400 bg-gray-100 text-gray-800 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-800 file:text-white hover:file:bg-blue-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          {loading && (
            <div className="text-sm text-blue-800 dark:text-blue-400 animate-pulse">
              Uploading file...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 dark:text-red-400 mt-2">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">{renderFiles()}</div>

      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={handleDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDelete}
              disabled={deleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
              className="w-full"
              autoFocus
            />
            {error && (
              <div className="text-sm text-red-700 dark:text-red-400 mt-2">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={cancelRename}
              disabled={renameLoading}
            >
              Cancel
            </Button>
            <Button
            variant="destructive"
              onClick={confirmRename}
              disabled={renameLoading || !newFileName.trim()}
            >
              {renameLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
