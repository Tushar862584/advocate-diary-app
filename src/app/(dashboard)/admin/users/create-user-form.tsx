"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CreateUserForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email and password are required");
      toast.error("Name, email and password are required");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    // Show a loading toast
    const loadingToastId = toast.loading("Creating user...");
    
    try {
      // Create the user with basic information only
      const apiPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      
      console.log("Creating user:", apiPayload);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }
      
      console.log("User created:", data);
      
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
      
      if (data.user && data.user.id) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "USER",
        });
        
        // Show success toast
        toast.success(`User ${data.user.name} created successfully!`);
        
        // Refresh the users list
        router.refresh();
        
        // Redirect to personal info page to complete profile
        router.push(`/admin/personal-info/${data.user.id}/edit?new=true`);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "An error occurred");
      
      // Dismiss the loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="USER">Regular User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      
      <div className="mt-2 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-600">
          <AlertCircle className="h-4 w-4 inline-block mr-1" />
          After creating the user, you will be redirected to complete their profile with additional details and document uploads.
        </p>
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          className="w-full sm:w-auto rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 transition-colors font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Creating User...
            </span> 
            : "Create User & Continue"}
        </button>
      </div>
    </form>
  );
} 