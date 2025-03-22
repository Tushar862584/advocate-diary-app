"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  caseCount: number;
}

interface BulkCaseAssignmentFormProps {
  users: UserData[];
  unassignedCount: number;
}

export default function BulkCaseAssignmentForm({ 
  users, 
  unassignedCount 
}: BulkCaseAssignmentFormProps) {
  const router = useRouter();
  const [sourceUserId, setSourceUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mode, setMode] = useState<"transfer-user">("transfer-user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    
    // Validate form
    if (mode === "transfer-user" && !sourceUserId) {
      setError("Please select a source user");
      setIsSubmitting(false);
      return;
    }
    
    if (!targetUserId) {
      setError("Please select a target user");
      setIsSubmitting(false);
      return;
    }
    
    // Confirm if transferring from one user to another
    if (mode === "transfer-user" && sourceUserId) {
      const sourceUser = users.find(u => u.id === sourceUserId);
      const targetUser = users.find(u => u.id === targetUserId);
      
      if (!confirm(
        `Are you sure you want to transfer all cases (${sourceUser?.caseCount || 0}) from ${sourceUser?.name} to ${targetUser?.name}?`
      )) {
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      const response = await fetch("/api/admin/cases/reassign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceUserId: mode === "assign-unassigned" ? null : sourceUserId,
          targetUserId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reassign cases");
      }
      
      const data = await response.json();
      setSuccessMessage(`${data.count} case(s) have been reassigned successfully`);
      
      // Reset form
      if (mode === "transfer-user") {
        setSourceUserId(null);
      }
      setTargetUserId("");
      
      // Refresh the page data
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-600">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <h3 className="mb-4 text-lg font-medium">Transfer Cases Between Users</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Transfer cases from:
          </label>
          <select
            value={sourceUserId || ""}
            onChange={(e) => setSourceUserId(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            <option value="">-- Select source user --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.caseCount} cases)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium">
            Transfer to:
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            <option value="">-- Select target user --</option>
            {users.map((user) => (
              <option 
                key={user.id} 
                value={user.id}
                disabled={user.id === sourceUserId}
              >
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Transfer Cases"}
          </button>
        </div>
      </form>
    </div>
  );
} 