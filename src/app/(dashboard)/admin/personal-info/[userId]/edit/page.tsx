"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/styledButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { use } from "react"; // Import the use hook

type PersonalInfo = {
  id?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  idNumber?: string | null;
  notes?: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  personalInfo: PersonalInfo | null;
};

export default function EditPersonalInfoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const searchParams = useSearchParams();
  const isNewUser = searchParams?.get("new") === "true";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    dateOfBirth: "",
    idNumber: "",
    notes: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);

          // Initialize form with existing data if available
          if (data.user.personalInfo) {
            const personalInfo = data.user.personalInfo;
            setFormData({
              id: personalInfo.id,
              address: personalInfo.address || "",
              city: personalInfo.city || "",
              state: personalInfo.state || "",
              zipCode: personalInfo.zipCode || "",
              phoneNumber: personalInfo.phoneNumber || "",
              dateOfBirth: personalInfo.dateOfBirth
                ? new Date(personalInfo.dateOfBirth).toISOString().split("T")[0]
                : "",
              idNumber: personalInfo.idNumber || "",
              notes: personalInfo.notes || "",
            });
          }
        } else {
          toast.error("Failed to load user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An error occurred while loading user details");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Show loading toast
    const loadingToastId = toast.loading("Saving personal information...");

    try {
      // Format date properly if it exists
      const dataToSubmit = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
      };

      const response = await fetch(`/api/admin/users/${userId}/personal-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (response.ok) {
        // Show success toast notification
        toast.success(
          `Personal information for ${user?.name} saved successfully`
        );

        // If this is a new user, redirect to the upload page after saving
        if (isNewUser) {
          router.push(`/admin/personal-info/${userId}/upload?new=true`);
        } else {
          router.push(`/admin/personal-info/${userId}`);
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save personal information");
      }
    } catch (error) {
      console.error("Error saving personal information:", error);

      // Dismiss loading toast if still active
      toast.dismiss(loadingToastId);

      // Show error toast
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSkipToUpload = () => {
    router.push(`/admin/personal-info/${userId}/upload?new=true`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">
            User not found
          </h2>
          <Button
            onClick={() => router.push("/admin/personal-info")}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {isNewUser && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-700">
              Complete User Setup
            </h2>
            <p className="text-blue-600 mt-1">
              The user account has been created successfully. Add personal
              information below or proceed to document uploads.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {isNewUser
                ? "Complete User Profile"
                : "Edit Personal Information"}
            </h1>
            <p className="text-slate-600">
              {user.name} - {user.email}
            </p>
          </div>
          {isNewUser ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push("/admin/users")}
                variant="link"
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
              <Button
                onClick={handleSkipToUpload}
                variant="link"
                className="text-sm flex items-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Skip to Upload
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push(`/admin/personal-info/${userId}`)}
              variant="link"
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isNewUser
                ? "Add the user's personal information"
                : "Edit the user's personal and contact information"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="idNumber">
                    ID Number (Bar Association/Government ID)
                  </Label>
                  <Input
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber || ""}
                    onChange={handleInputChange}
                    placeholder="ID number"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Address</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                    <Input
                      id="city"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                    <Input
                      id="state"
                      name="state"
                      value={formData.state || ""}
                      onChange={handleInputChange}
                      placeholder="State/Province"
                    />
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode || ""}
                      onChange={handleInputChange}
                      placeholder="Zip/Postal code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Any additional notes about this user"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isNewUser ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleSkipToUpload}
                  >
                    Skip to Document Upload
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="mr-2">Saving...</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save & Continue to Uploads
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="mr-2">Saving...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
