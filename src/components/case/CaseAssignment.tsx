"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

interface CaseAssignmentProps {
  caseId: string;
  currentUserId: string | null;
  currentUserName: string | null;
  isAdmin: boolean;
}

export default function CaseAssignment({
  caseId,
  currentUserId: initialUserId,
  currentUserName: initialUserName,
  isAdmin,
}: CaseAssignmentProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Keep track of the current assignment locally
  const [currentUserId, setCurrentUserId] = useState(initialUserId);
  const [currentUserName, setCurrentUserName] = useState(initialUserName);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [preservedItems, setPreservedItems] = useState<{
    notes: number;
    files: number;
  } | null>(null);
  // Add a state to track if we need to refresh assignment data
  const [refreshAssignment, setRefreshAssignment] = useState(false);

  // Check if the URL has an assignment hash fragment
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#assignment") {
        setShowAssignForm(true);
      }
    }
  }, []);

  // Fetch case assignment details when needed
  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!refreshAssignment) return;

      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch updated case details");
        }

        const data = await response.json();
        if (data.user) {
          setCurrentUserId(data.user.id);
          setCurrentUserName(data.user.name);
          setSelectedUserId(data.user.id);
        } else {
          setCurrentUserId(null);
          setCurrentUserName(null);
          setSelectedUserId("");
        }

        // Reset refresh flag after updating
        setRefreshAssignment(false);
      } catch (error) {
        console.error("Error fetching updated case details:", error);
        // Reset refresh flag even on error
        setRefreshAssignment(false);
      }
    };

    fetchCaseDetails();
  }, [caseId, refreshAssignment]);

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin || !showAssignForm) return;

      try {
        setLoading(true);
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        // API returns the users array directly, not wrapped in a 'users' object
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showAssignForm, isAdmin]);

  const handleAssignCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    setPreservedItems(null);

    // If no user is selected, show an error
    if (!selectedUserId) {
      setError(
        "Please select a user to assign the case to. Cases cannot be unassigned."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/cases/${caseId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign case");
      }

      const data = await response.json();

      // Find the name of the user we just assigned the case to
      const assignedUser = users.find((user) => user.id === selectedUserId);
      const assignedUserName = assignedUser
        ? assignedUser.name
        : "Selected user";

      // Update our local state with the new assignment
      setCurrentUserId(selectedUserId);
      setCurrentUserName(assignedUserName);

      setSuccessMessage(data.message || "Case assigned successfully");

      // Store preserved items information if available
      if (data.preservedItems) {
        setPreservedItems(data.preservedItems);
      }

      // Refresh the page to update other components
      router.refresh();

      // Close the form after successful submission
      setShowAssignForm(false);

      // Remove the hash fragment from URL
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignForm = () => {
    setShowAssignForm(!showAssignForm);
    setError("");
    setSuccessMessage("");

    // Remove or add the hash fragment from URL
    if (typeof window !== "undefined") {
      if (!showAssignForm) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}#assignment`
        );
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  };

  // Only render the component for admins
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mb-6" id="assignment">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-medium">Case Assignment</h3>
        <button
          type="button"
          onClick={toggleAssignForm}
          className="rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
        >
          {showAssignForm
            ? "Cancel"
            : currentUserId
            ? "Reassign Case"
            : "Assign Case"}
        </button>
      </div>

      <div className="rounded-lg border bg-white p-4">
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-2 text-sm text-green-600">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {!showAssignForm ? (
          <div>
            <p className="text-sm text-gray-500">Currently Assigned To:</p>
            <p>{currentUserName || "Not assigned"}</p>

            {preservedItems &&
              (preservedItems.notes > 0 || preservedItems.files > 0) && (
                <div className="mt-3 rounded-md bg-blue-50 p-2 text-sm">
                  <p className="font-medium text-blue-700">
                    Content from previous assignees preserved:
                  </p>
                  <ul className="list-disc pl-5 text-blue-600">
                    {preservedItems.notes > 0 && (
                      <li>
                        {preservedItems.notes} note
                        {preservedItems.notes !== 1 ? "s" : ""}
                      </li>
                    )}
                    {preservedItems.files > 0 && (
                      <li>
                        {preservedItems.files} file
                        {preservedItems.files !== 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                  <p className="mt-1 text-xs text-blue-500">
                    All notes and files from previous lawyers remain accessible
                    for case continuity.
                  </p>
                </div>
              )}
          </div>
        ) : (
          <form onSubmit={handleAssignCase}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Assign to User:
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                disabled={isSubmitting || loading}
              >
                <option value="" disabled>
                  -- Select a user --
                </option>
                {Array.isArray(users) &&
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
              {loading && (
                <p className="mt-1 text-sm text-gray-500">Loading users...</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Note: Cases must be assigned to a user.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
