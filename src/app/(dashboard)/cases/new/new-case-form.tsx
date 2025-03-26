"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CourtSelector from "@/components/court-selector";

interface Petitioner {
  name: string;
  advocate: string;
}

interface Respondent {
  name: string;
  advocate: string;
}

interface FormData {
  caseType: string;
  registrationNum: string;
  registrationYear: string;
  title: string;
  courtName: string;
  petitioners: Petitioner[];
  respondents: Respondent[];
}

interface NewCaseFormProps {
  userId: string;
}

export default function NewCaseForm({ userId }: NewCaseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    caseType: "",
    registrationNum: "",
    registrationYear: new Date().getFullYear().toString(),
    title: "",
    courtName: "",
    petitioners: [{ name: "", advocate: "" }],
    respondents: [{ name: "", advocate: "" }],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePetitionerChange = (
    index: number,
    field: keyof Petitioner,
    value: string
  ) => {
    const updatedPetitioners = [...formData.petitioners];
    updatedPetitioners[index] = {
      ...updatedPetitioners[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      petitioners: updatedPetitioners,
    });
  };

  const handleRespondentChange = (
    index: number,
    field: keyof Respondent,
    value: string
  ) => {
    const updatedRespondents = [...formData.respondents];
    updatedRespondents[index] = {
      ...updatedRespondents[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      respondents: updatedRespondents,
    });
  };

  const addPetitioner = () => {
    setFormData({
      ...formData,
      petitioners: [...formData.petitioners, { name: "", advocate: "" }],
    });
  };

  const removePetitioner = (index: number) => {
    if (formData.petitioners.length > 1) {
      const updatedPetitioners = [...formData.petitioners];
      updatedPetitioners.splice(index, 1);
      setFormData({
        ...formData,
        petitioners: updatedPetitioners,
      });
    }
  };

  const addRespondent = () => {
    setFormData({
      ...formData,
      respondents: [...formData.respondents, { name: "", advocate: "" }],
    });
  };

  const removeRespondent = (index: number) => {
    if (formData.respondents.length > 1) {
      const updatedRespondents = [...formData.respondents];
      updatedRespondents.splice(index, 1);
      setFormData({
        ...formData,
        respondents: updatedRespondents,
      });
    }
  };

  const handleChangeCourtName = (courtName: string) => {
    setFormData((prev) => ({
      ...prev,
      courtName,
    }));
  };

  const validateForm = () => {
    if (!formData.caseType) return "Case type is required";
    if (!formData.registrationNum) return "Registration number is required";
    if (!formData.registrationYear) return "Registration year is required";
    if (!formData.courtName) return "Court name is required";

    // Validate petitioners
    if (formData.petitioners.length === 0)
      return "At least one petitioner is required";
    for (const petitioner of formData.petitioners) {
      if (!petitioner.name) return "Petitioner name is required";
    }

    // Validate respondents
    if (formData.respondents.length === 0)
      return "At least one respondent is required";
    for (const respondent of formData.respondents) {
      if (!respondent.name) return "Respondent name is required";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        registrationNum: parseInt(formData.registrationNum),
        registrationYear: parseInt(formData.registrationYear),
        userId,
      };

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Case created successfully!");
        // Navigate to the case detail page
        setTimeout(() => {
          router.push(`/cases/${data.id}`);
        }, 1000);
      } else {
        setError(data.error || "Failed to create case");
      }
    } catch (err) {
      setError("An error occurred while creating the case");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg border border-green-200"
          role="alert"
        >
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Case Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="caseType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Case Type *
            </label>
            <input
              type="text"
              id="caseType"
              name="caseType"
              value={formData.caseType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="registrationNum"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Registration Number *
            </label>
            <input
              type="number"
              id="registrationNum"
              name="registrationNum"
              value={formData.registrationNum}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="registrationYear"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Registration Year *
            </label>
            <input
              type="number"
              id="registrationYear"
              name="registrationYear"
              value={formData.registrationYear}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <CourtSelector
              id="courtName"
              name="courtName"
              value={formData.courtName}
              onChange={handleChangeCourtName}
              required
              label="Court Name"
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Case Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Will be auto-generated if left blank"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Petitioners
        </h2>

        {formData.petitioners.map((petitioner, index) => (
          <div
            key={index}
            className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-gray-800">
                Petitioner {index + 1}
              </h3>
              {formData.petitioners.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePetitioner(index)}
                  className="text-red-700 hover:text-red-900"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={petitioner.name}
                  onChange={(e) =>
                    handlePetitionerChange(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advocate
                </label>
                <input
                  type="text"
                  value={petitioner.advocate}
                  onChange={(e) =>
                    handlePetitionerChange(index, "advocate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addPetitioner}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-800 bg-indigo-100 hover:bg-indigo-200"
        >
          Add Another Petitioner
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Respondents
        </h2>

        {formData.respondents.map((respondent, index) => (
          <div
            key={index}
            className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-gray-800">
                Respondent {index + 1}
              </h3>
              {formData.respondents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRespondent(index)}
                  className="text-red-700 hover:text-red-900"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={respondent.name}
                  onChange={(e) =>
                    handleRespondentChange(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advocate
                </label>
                <input
                  type="text"
                  value={respondent.advocate}
                  onChange={(e) =>
                    handleRespondentChange(index, "advocate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRespondent}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-800 bg-indigo-100 hover:bg-indigo-200"
        >
          Add Another Respondent
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push("/cases")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Case"}
        </button>
      </div>
    </form>
  );
}
