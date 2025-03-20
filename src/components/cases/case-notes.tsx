"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { groupByDate, formatDateHeading, sortDatesDescending, formatRelativeTime } from "@/lib/date-utils";
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

interface User {
  id: string;
  name: string;
  email: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}

interface CaseNotesProps {
  caseId: string;
  notes: Note[];
}

export function CaseNotes({ caseId, notes }: CaseNotesProps) {
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
    if (!content.trim()) return;

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    !searchQuery || 
    note.content.toLowerCase().includes(searchQuery) ||
    note.user.name.toLowerCase().includes(searchQuery)
  );

  // Group notes by date if enabled
  const renderNotes = () => {
    if (filteredNotes.length === 0) {
      if (searchQuery) {
        return <p className="text-sm text-slate-400">No notes match your search query.</p>;
      }
      return <p className="text-sm text-slate-400">No notes yet. Add the first note above.</p>;
    }

    if (!groupByDateEnabled) {
      // Render notes without grouping
      return filteredNotes.map((note) => renderNoteItem(note));
    }

    // Group notes by date
    const groupedNotes = groupByDate(filteredNotes, 'createdAt');
    const sortedDates = sortDatesDescending(Object.keys(groupedNotes));

    return sortedDates.map((dateKey) => (
      <div key={dateKey} className="mb-6">
        <h3 className="mb-2 px-2 py-1 text-sm font-medium text-slate-300 bg-slate-700 rounded">
          {formatDateHeading(dateKey)}
        </h3>
        <div className="space-y-3 pl-2">
          {groupedNotes[dateKey].map((note) => renderNoteItem(note))}
        </div>
      </div>
    ));
  };

  // Render individual note item
  const renderNoteItem = (note: Note) => (
    <div key={note.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium text-blue-300">{note.user.name}</div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-slate-400">
            {formatRelativeTime(note.createdAt)}
          </div>
          <button 
            onClick={() => handleDelete(note.id)}
            className="text-slate-400 hover:text-red-400"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-slate-200">{note.content}</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Notes & Comments</h2>
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
          placeholder="Search notes..." 
        />
      </div>

      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-4">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200"
            placeholder="Add a note..."
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {renderNotes()}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
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