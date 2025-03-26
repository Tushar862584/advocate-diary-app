"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof showPasswords],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      // Reset form and show success message
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Card className="mx-auto max-w-md shadow-md border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-slate-700 mb-1">
            <Lock size={18} className="text-slate-500" />
            <CardTitle className="text-lg sm:text-xl text-slate-800">
              Change Password
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            Update your account password
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {error && (
            <Alert
              variant="error"
              className="mb-4 sm:mb-6 bg-red-50 border-red-200 text-red-800 text-xs sm:text-sm p-2 sm:p-4"
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              className="mb-4 sm:mb-6 bg-green-50 border-green-200 text-green-800 text-xs sm:text-sm p-2 sm:p-4"
            >
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs sm:text-sm font-medium text-slate-700 mb-1"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"
                    tabIndex={-1}
                  >
                    {showPasswords.currentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs sm:text-sm font-medium text-slate-700 mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"
                    tabIndex={-1}
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs sm:text-sm font-medium text-slate-700 mb-1"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:border-slate-400 focus:outline-none focus:ring-slate-400"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"
                    tabIndex={-1}
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm w-full sm:w-auto"
              >
                {isSubmitting ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
