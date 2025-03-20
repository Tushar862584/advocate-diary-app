"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { groupByDate, formatDateHeading, sortDatesDescending } from "@/lib/date-utils";
import { SearchBar } from "@/components/search-bar";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";

interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: Date;
}

interface CaseFilesProps {
  caseId: string;
  files: Upload[];
}

export function CaseFiles({ caseId, files }: CaseFilesProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupByDateEnabled, setGroupByDateEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

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
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error instanceof Error ? error.message : "Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/uploads/${fileToDelete}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Server error:", result);
        throw new Error(result.error || "Failed to delete file");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting file:", error);
      setError(error instanceof Error ? error.message : "Error deleting file");
      // Keep the dialog open if there's an error
      setDeleteLoading(false);
      return;
    }
    
    // Only close dialog and reset state if successful
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setFileToDelete(null);
    setError(null);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
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

  // Render individual file item
  const renderFileItem = (file: Upload) => (
    <div key={file.id} className="relative group">
      <a
        href={file.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-4 border border-slate-700 rounded-lg bg-slate-800 hover:bg-slate-700"
      >
        <span className="text-2xl mr-3">{getFileIcon(file.fileType)}</span>
        <div className="overflow-hidden">
          <p className="font-medium truncate text-slate-200">{file.fileName}</p>
          <p className="text-xs text-slate-400">
            {new Date(file.createdAt).toLocaleDateString()}
          </p>
        </div>
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDelete(file.id);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete file"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  // Render files based on grouping preference
  const renderFiles = () => {
    if (filteredFiles.length === 0) {
      if (searchQuery) {
        return <p className="text-sm text-slate-400">No files match your search query.</p>;
      }
      return <p className="text-sm text-slate-400">No files uploaded yet.</p>;
    }

    if (!groupByDateEnabled) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(file => renderFileItem(file))}
        </div>
      );
    }

    // Group files by date
    const groupedFiles = groupByDate(filteredFiles, 'createdAt');
    const sortedDates = sortDatesDescending(Object.keys(groupedFiles));

    return sortedDates.map(dateKey => (
      <div key={dateKey} className="mb-6">
        <h3 className="mb-2 px-2 py-1 text-sm font-medium text-slate-300 bg-slate-700 rounded">
          {formatDateHeading(dateKey)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
          {groupedFiles[dateKey].map(file => renderFileItem(file))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Case Files & Documents</h2>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 text-sm text-slate-300">Group by date</span>
            <div className={`relative inline-block w-10 h-5 rounded-full transition-colors ${groupByDateEnabled ? 'bg-blue-600' : 'bg-slate-600'}`}>
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={groupByDateEnabled}
                onChange={() => setGroupByDateEnabled(!groupByDateEnabled)}
              />
              <span className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition-transform ${groupByDateEnabled ? 'transform translate-x-5' : ''}`}></span>
            </div>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search files..." 
        />
      </div>

      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-4">
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Upload File (PDF, Images)
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm border border-slate-700 bg-slate-900 text-slate-200 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        {loading && (
          <div className="text-sm text-blue-400 animate-pulse">
            Uploading file...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 mt-2">{error}</div>
        )}
      </div>

      <div className="space-y-4">
        {renderFiles()}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
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
    </div>
  );
} 