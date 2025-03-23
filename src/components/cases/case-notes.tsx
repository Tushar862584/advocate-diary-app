"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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

interface User {
  id: string;
  name: string;
  email: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  userId?: string;
  user?: User;
}

interface CaseNotesProps {
  caseId: string;
  notes: Note[];
  canAdd?: boolean;
  currentUserId?: string;
}

export function CaseNotes({
  caseId,
  notes,
  canAdd = true,
  currentUserId,
}: CaseNotesProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupByDateEnabled, setGroupByDateEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !canAdd) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      setContent("");
      router.refresh();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      !searchQuery ||
      note.content.toLowerCase().includes(searchQuery) ||
      (note.user?.name && note.user.name.toLowerCase().includes(searchQuery))
  );

  // Group notes by date if enabled
  const renderNotes = () => {
    if (filteredNotes.length === 0) {
      if (searchQuery) {
        return (
          <p className="text-sm text-slate-600">
            No notes match your search query.
          </p>
        );
      }
      return (
        <p className="text-sm text-slate-600">
          No notes yet. {canAdd ? "Add the first note above." : ""}
        </p>
      );
    }

    if (!groupByDateEnabled) {
      // Render notes without grouping
      return filteredNotes.map((note) => renderNoteItem(note));
    }

    // Group notes by date
    const groupedNotes = groupByDate(filteredNotes, "createdAt");
    const sortedDates = sortDatesDescending(Object.keys(groupedNotes));

    return sortedDates.map((dateKey) => (
      <div key={dateKey} className="mb-6">
        <h3 className="mb-2 px-3 py-1.5 text-sm font-medium text-slate-50 bg-slate-700 rounded">
          {formatDateHeading(dateKey)}
        </h3>
        <div className="space-y-3 pl-1 sm:pl-2">
          {groupedNotes[dateKey].map((note) => renderNoteItem(note))}
        </div>
      </div>
    ));
  };

  // Render individual note item
  const renderNoteItem = (note: Note) => (
    <div
      key={note.id}
      className="rounded-lg border border-slate-300 bg-slate-100 p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium text-blue-700">
          {note.user?.name || "Former User"}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-slate-600">
            {formatRelativeTime(note.createdAt)}
          </div>
          {/* Only show delete button if user has permission */}
          {canAdd && (
            <button
              onClick={() => handleDelete(note.id)}
              className="text-slate-500 hover:text-red-600 p-1 rounded-full hover:bg-slate-200"
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="whitespace-pre-wrap text-slate-800">{note.content}</p>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg font-bold text-slate-800">Notes & Comments</h2>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 text-sm font-medium text-slate-700">
              Group by date
            </span>
            <div
              className={`relative inline-block w-10 h-5 rounded-full transition-colors ${
                groupByDateEnabled ? "bg-blue-600" : "bg-slate-400"
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
        <SearchBar onSearch={handleSearch} placeholder="Search notes..." />
      </div>

      {/* Only show the add note form if the user has permission */}
      {canAdd && (
        <div className="mb-5 rounded-lg border border-slate-300 bg-slate-50 p-3 sm:p-4 shadow-sm">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-slate-800 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Add a note..."
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="rounded-md bg-blue-700 px-3 py-2 text-sm sm:text-base text-white hover:bg-blue-600 disabled:opacity-50 sm:px-4 shadow-sm"
              >
                {loading ? "Adding..." : "Add Note"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">{renderNotes()}</div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">
              Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDelete}
              disabled={deleteLoading}
              className="border border-slate-300 text-slate-200 hover:bg-slate-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
