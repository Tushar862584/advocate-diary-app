"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, File } from "lucide-react";

export default function CreateUserForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    address: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [documents, setDocuments] = useState<{id: string, name: string, size: string, type: string}[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    // Process each selected file
    Array.from(files).forEach(file => {
      // Format file size
      const sizeInKB = file.size / 1024;
      const sizeStr = sizeInKB < 1024 
        ? `${sizeInKB.toFixed(1)} KB` 
        : `${(sizeInKB / 1024).toFixed(1)} MB`;

      // Add file to documents list with formatted info
      setDocuments(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: sizeStr,
        type: file.type,
      }]);
    });

    // Clear the file input for future selections
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // Note: We're only sending the original fields to the API
      // The new fields are just for display
      const apiPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
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
      
      // Reset form and show success message
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
        address: "",
        phoneNumber: "",
      });
      setDocuments([]);
      setSuccess("User created successfully");
      
      // Refresh the page to show the new user in the list
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}
      
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
        
        {/* New Fields: Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isSubmitting}
            placeholder="e.g., +91 98765 43210"
          />
        </div>
        
        {/* New Fields: Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isSubmitting}
            placeholder="Full address with city, state and pin code"
          />
        </div>
      </div>
      
      {/* Document Upload Section */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Verification Documents
          </label>
          <button
            type="button"
            onClick={handleFileSelect}
            className="inline-flex items-center rounded-md border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
            disabled={isSubmitting}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Document
          </button>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
        
        {documents.length === 0 ? (
          <div 
            onClick={handleFileSelect}
            className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 transition hover:border-blue-500"
          >
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">
              Click to select verification documents from your computer
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Supported formats: PDF, JPG, PNG (Max 5MB)
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <ul className="divide-y divide-gray-200">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="rounded-md bg-blue-100 p-2 text-blue-600">
                      <File className="h-5 w-5" />
                    </div>
                    <div className="ml-2">
                      <span className="block text-sm font-medium text-gray-700">{doc.name}</span>
                      <span className="block text-xs text-gray-500">{doc.size} • {doc.type}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Please upload valid identification documents for verification.
        </p>
      </div>
      
      <div className="mt-4">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
} 