"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, RotateCw } from "lucide-react";

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
  unassignedCount,
}: BulkCaseAssignmentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sourceUserId, setSourceUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mode, setMode] = useState<"transfer-user" | "assign-unassigned">(
    "transfer-user"
  );

  // Track if the admin is transferring their own cases
  const isAdminTransferringSelf = sourceUserId === session?.user?.id;

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

    // Confirm action based on mode
    if (mode === "transfer-user" && sourceUserId) {
      const sourceUser = users.find((u) => u.id === sourceUserId);
      const targetUser = users.find((u) => u.id === targetUserId);

      let confirmMessage = `Are you sure you want to transfer all cases (${
        sourceUser?.caseCount || 0
      }) from ${sourceUser?.name} to ${targetUser?.name}?`;

      // Add a note about PERSONAL cases if admin is transferring own cases
      if (isAdminTransferringSelf) {
        confirmMessage += "\n\nNote: PERSONAL cases will not be transferred.";
      }

      if (!confirm(confirmMessage)) {
        setIsSubmitting(false);
        return;
      }
    } else if (mode === "assign-unassigned") {
      const targetUser = users.find((u) => u.id === targetUserId);

      if (
        !confirm(
          `Are you sure you want to assign all unassigned cases (${unassignedCount}) to ${targetUser?.name}?`
        )
      ) {
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
      setSuccessMessage(
        data.message ||
          `${data.count} case(s) have been reassigned successfully`
      );

      // Reset form
      if (mode === "transfer-user") {
        setSourceUserId(null);
      }
      setTargetUserId("");

      // Refresh the page data
      router.refresh();
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600 border border-green-200 flex items-start">
          <div className="flex-shrink-0 text-green-500 mr-2">✓</div>
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-base font-medium text-slate-800 mb-1">Assignment Options</h3>
        <p className="text-sm text-slate-500">Choose the type of case assignment operation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              name="mode"
              value="transfer-user"
              checked={mode === "transfer-user"}
              onChange={() => setMode("transfer-user")}
            />
            <span className="text-sm font-medium text-slate-700">Transfer between users</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              name="mode"
              value="assign-unassigned"
              checked={mode === "assign-unassigned"}
              onChange={() => setMode("assign-unassigned")}
              disabled={unassignedCount === 0}
            />
            <span className="text-sm font-medium text-slate-700">
              Assign unassigned cases
              <span className="ml-1 text-blue-600 font-semibold">({unassignedCount})</span>
            </span>
          </label>
        </div>

        {mode === "transfer-user" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Transfer cases from:
            </label>
            <select
              value={sourceUserId || ""}
              onChange={(e) => setSourceUserId(e.target.value)}
              className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">-- Select source user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.caseCount} cases)
                </option>
              ))}
            </select>

            {isAdminTransferringSelf && (
              <div className="flex items-start space-x-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-md border border-amber-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Note:</strong> When transferring cases from your own
                  account, PERSONAL cases will be excluded from the transfer.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {mode === "transfer-user" ? "Transfer to:" : "Assign to:"}
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">-- Select target user --</option>
            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
                disabled={mode === "transfer-user" && user.id === sourceUserId}
              >
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {mode === "transfer-user" ? "Transfer Cases" : "Assign Unassigned Cases"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
