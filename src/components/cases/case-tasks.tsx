"use client";

import { useState, useCallback } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface CaseTasksProps {
  caseId: string;
  tasks: Task[];
}

export function CaseTasks({ caseId, tasks }: CaseTasksProps) {
  const router = useRouter();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupByDateEnabled, setGroupByDateEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      setNewTaskTitle("");
      router.refresh();
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    !searchQuery || task.title.toLowerCase().includes(searchQuery)
  );

  // Render individual task item
  const renderTaskItem = (task: Task) => (
    <div
      key={task.id}
      className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800 hover:bg-slate-700"
    >
      <div className="flex items-center">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={(checked) => {
            toggleTaskStatus(task.id, checked as boolean);
          }}
          className="mr-3"
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`cursor-pointer ${
            task.completed ? "text-slate-400 line-through" : "text-slate-200"
          }`}
        >
          {task.title}
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-400">
          {formatRelativeTime(task.createdAt)}
        </span>
        <button 
          onClick={() => handleDelete(task.id)}
          className="text-slate-400 hover:text-red-400"
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Render tasks based on grouping preference
  const renderTasks = () => {
    if (filteredTasks.length === 0) {
      if (searchQuery) {
        return <p className="text-sm text-slate-400">No tasks match your search query.</p>;
      }
      return <p className="text-sm text-slate-400">No tasks added yet.</p>;
    }

    if (!groupByDateEnabled) {
      return (
        <div className="space-y-2">
          {filteredTasks.map(task => renderTaskItem(task))}
        </div>
      );
    }

    // Group tasks by date
    const groupedTasks = groupByDate(filteredTasks, 'createdAt');
    const sortedDates = sortDatesDescending(Object.keys(groupedTasks));

    return sortedDates.map(dateKey => (
      <div key={dateKey} className="mb-4">
        <h3 className="mb-2 px-2 py-1 text-sm font-medium text-slate-300 bg-slate-700 rounded">
          {formatDateHeading(dateKey)}
        </h3>
        <div className="space-y-2 pl-2">
          {groupedTasks[dateKey].map(task => renderTaskItem(task))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100">Tasks</h2>
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
          placeholder="Search tasks..." 
        />
      </div>

      <form onSubmit={handleAddTask} className="mb-4 flex">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 rounded-l-md bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          disabled={isSubmitting || !newTaskTitle.trim()}
          className="rounded-l-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Add"
          )}
        </Button>
      </form>

      <div>
        {renderTasks()}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteLoading}>Cancel</AlertDialogCancel>
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