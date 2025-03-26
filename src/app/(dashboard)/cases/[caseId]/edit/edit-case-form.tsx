"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CourtSelector from "@/components/court-selector";
import { Trash2, Save, X, UserPlus, UserMinus } from "lucide-react";

interface Petitioner {
  id: string;
  name: string;
  advocate?: string | null;
  caseId: string;
}

interface Respondent {
  id: string;
  name: string;
  advocate?: string | null;
  caseId: string;
}

interface Case {
  id: string;
  caseType: string;
  registrationYear: number;
  registrationNum: number;
  title: string;
  courtName: string;
  userId: string;
}

interface EditCaseFormProps {
  caseDetail: Case;
  petitioners: Petitioner[];
  respondents: Respondent[];
}

export default function EditCaseForm({
  caseDetail,
  petitioners: initialPetitioners,
  respondents: initialRespondents,
}: EditCaseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    caseType: caseDetail.caseType,
    registrationYear: caseDetail.registrationYear,
    registrationNum: caseDetail.registrationNum,
    title: caseDetail.title,
    courtName: caseDetail.courtName,
  });

  const [petitioners, setPetitioners] = useState<
    Array<{
      id?: string;
      name: string;
      advocate: string;
      isNew?: boolean;
      isDeleted?: boolean;
    }>
  >(
    initialPetitioners.map((p) => ({
      id: p.id,
      name: p.name,
      advocate: p.advocate || "",
    }))
  );

  const [respondents, setRespondents] = useState<
    Array<{
      id?: string;
      name: string;
      advocate: string;
      isNew?: boolean;
      isDeleted?: boolean;
    }>
  >(
    initialRespondents.map((r) => ({
      id: r.id,
      name: r.name,
      advocate: r.advocate || "",
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "registrationYear" || name === "registrationNum"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleCourtNameChange = (courtName: string) => {
    setFormData((prev) => ({
      ...prev,
      courtName,
    }));
  };

  const addPetitioner = () => {
    setPetitioners([...petitioners, { name: "", advocate: "", isNew: true }]);
  };

  const removePetitioner = (index: number) => {
    const newPetitioners = [...petitioners];

    // If it's an existing petitioner, mark as deleted instead of removing
    if (newPetitioners[index].id) {
      newPetitioners[index].isDeleted = true;
    } else {
      newPetitioners.splice(index, 1);
    }

    setPetitioners(newPetitioners);
  };

  const updatePetitioner = (index: number, field: string, value: string) => {
    const newPetitioners = [...petitioners];
    newPetitioners[index] = { ...newPetitioners[index], [field]: value };
    setPetitioners(newPetitioners);
  };

  const addRespondent = () => {
    setRespondents([...respondents, { name: "", advocate: "", isNew: true }]);
  };

  const removeRespondent = (index: number) => {
    const newRespondents = [...respondents];

    // If it's an existing respondent, mark as deleted instead of removing
    if (newRespondents[index].id) {
      newRespondents[index].isDeleted = true;
    } else {
      newRespondents.splice(index, 1);
    }

    setRespondents(newRespondents);
  };

  const updateRespondent = (index: number, field: string, value: string) => {
    const newRespondents = [...respondents];
    newRespondents[index] = { ...newRespondents[index], [field]: value };
    setRespondents(newRespondents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/cases/${caseDetail.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          petitioners: petitioners
            .filter((p) => !p.isDeleted)
            .map((p) => ({
              id: p.id,
              name: p.name,
              advocate: p.advocate || null,
              isNew: p.isNew || false,
            })),
          respondents: respondents
            .filter((r) => !r.isDeleted)
            .map((r) => ({
              id: r.id,
              name: r.name,
              advocate: r.advocate || null,
              isNew: r.isNew || false,
            })),
          petitionersToDelete: petitioners
            .filter((p) => p.isDeleted && p.id)
            .map((p) => p.id as string),
          respondentsToDelete: respondents
            .filter((r) => r.isDeleted && r.id)
            .map((r) => r.id as string),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update case");
      }

      // Navigate back to case details
      router.push(`/cases/${caseDetail.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/cases/${caseDetail.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete case");
      }

      // Navigate back to cases list
      router.push("/cases");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 sm:p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="caseType" className="block text-sm font-medium mb-1">
            Case Type
          </label>
          <input
            type="text"
            id="caseType"
            name="caseType"
            value={formData.caseType}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Case Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="registrationYear"
            className="block text-sm font-medium mb-1"
          >
            Registration Year
          </label>
          <input
            type="number"
            id="registrationYear"
            name="registrationYear"
            value={formData.registrationYear}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="registrationNum"
            className="block text-sm font-medium mb-1"
          >
            Registration Number
          </label>
          <input
            type="number"
            id="registrationNum"
            name="registrationNum"
            value={formData.registrationNum}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="courtName" className="block text-sm font-medium mb-1">
            Court Name
          </label>
          <CourtSelector
            id="courtName"
            name="courtName"
            value={formData.courtName}
            onChange={handleCourtNameChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Petitioners Section */}
      <div className="mt-6 sm:mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-medium">Petitioners</h3>
          <button
            type="button"
            onClick={addPetitioner}
            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-100 flex items-center"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            Add Petitioner
          </button>
        </div>

        {petitioners.map(
          (petitioner, index) =>
            !petitioner.isDeleted && (
              <div
                key={index}
                className="mb-3 sm:mb-4 rounded-md border border-gray-200 bg-gray-50 p-3 sm:p-4"
              >
                <div className="mb-3 grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={petitioner.name}
                      onChange={(e) =>
                        updatePetitioner(index, "name", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                      Advocate (Optional)
                    </label>
                    <input
                      type="text"
                      value={petitioner.advocate}
                      onChange={(e) =>
                        updatePetitioner(index, "advocate", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removePetitioner(index)}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  <UserMinus className="h-3.5 w-3.5 mr-1" />
                  Remove
                </button>
              </div>
            )
        )}

        {petitioners.filter((p) => !p.isDeleted).length === 0 && (
          <p className="text-xs sm:text-sm text-gray-500 italic py-2">
            No petitioners added. Please add at least one petitioner.
          </p>
        )}
      </div>

      {/* Respondents Section */}
      <div className="mt-6 sm:mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-medium">Respondents</h3>
          <button
            type="button"
            onClick={addRespondent}
            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-100 flex items-center"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            Add Respondent
          </button>
        </div>

        {respondents.map(
          (respondent, index) =>
            !respondent.isDeleted && (
              <div
                key={index}
                className="mb-3 sm:mb-4 rounded-md border border-gray-200 bg-gray-50 p-3 sm:p-4"
              >
                <div className="mb-3 grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={respondent.name}
                      onChange={(e) =>
                        updateRespondent(index, "name", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                      Advocate (Optional)
                    </label>
                    <input
                      type="text"
                      value={respondent.advocate}
                      onChange={(e) =>
                        updateRespondent(index, "advocate", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRespondent(index)}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  <UserMinus className="h-3.5 w-3.5 mr-1" />
                  Remove
                </button>
              </div>
            )
        )}

        {respondents.filter((r) => !r.isDeleted).length === 0 && (
          <p className="text-xs sm:text-sm text-gray-500 italic py-2">
            No respondents added. Please add at least one respondent.
          </p>
        )}
      </div>

      {/* Mobile-Friendly Form Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        {/* Delete button - on its own on mobile, left aligned on desktop */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-red-300 text-sm flex items-center justify-center sm:justify-start"
          disabled={isSubmitting || isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Case"}
        </button>

        {/* Action buttons stack on mobile, right aligned on desktop */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm flex items-center justify-center"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300 text-sm flex items-center justify-center"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal - improved for mobile */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm sm:max-w-md rounded-lg bg-white p-4 sm:p-6 shadow-lg">
            <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-bold text-gray-900">
              Confirm Delete
            </h3>
            <p className="mb-4 sm:mb-6 text-sm text-gray-700">
              Are you sure you want to delete this case?
              <br /> This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                disabled={isDeleting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:bg-red-300 flex items-center justify-center"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
