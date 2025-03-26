"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type User = {
  id: string;
  name: string;
  email: string;
};

// Add a helper function for the fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = 30000
) => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

// Add a utility function to check file types
const isValidFileType = (file: File) => {
  // Check the file extension
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  // Check MIME type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const hasValidMimeType = allowedTypes.includes(file.type);

  return hasValidExtension && hasValidMimeType;
};

export default function UploadUserFilesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const searchParams = useSearchParams();
  const isNewUser = searchParams?.get("new") === "true";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);

      // Filter out invalid file types
      const invalidFiles = newFiles.filter((file) => !isValidFileType(file));
      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map((f) => f.name).join(", ");
        toast.error(
          `Invalid file type(s): ${fileNames}. Only JPG, PNG, PDF, DOC, and DOCX files are allowed.`
        );
      }

      const validFiles = newFiles.filter((file) => isValidFileType(file));
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);

      // Filter out invalid file types
      const invalidFiles = droppedFiles.filter(
        (file) => !isValidFileType(file)
      );
      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map((f) => f.name).join(", ");
        toast.error(
          `Invalid file type(s): ${fileNames}. Only JPG, PNG, PDF, DOC, and DOCX files are allowed.`
        );
      }

      const validFiles = droppedFiles.filter((file) => isValidFileType(file));
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    // Check file sizes first
    const maxFileSizeMB = 10;
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSizeBytes);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      toast.error(
        `Some files exceed the ${maxFileSizeMB}MB limit: ${fileNames}`
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let failCount = 0;
    const totalFiles = files.length;

    // Create a toast ID for live updating the progress
    const toastId = toast.loading(`Uploading files (0/${totalFiles})...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        // Use a longer timeout for larger files
        const timeoutMs = Math.max(30000, file.size / 1024); // Minimum 30s, or longer based on file size

        // Update toast with current progress
        toast.loading(`Uploading files (${i + 1}/${totalFiles})...`, {
          id: toastId,
        });

        const response = await fetchWithTimeout(
          "/api/admin/users/upload",
          {
            method: "POST",
            body: formData,
          },
          timeoutMs
        );

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          // Parse the error message from the server response
          try {
            const errorData = await response.json();
            console.error(
              `Failed to upload ${file.name}: ${errorData.message}`
            );
            toast.error(`Failed to upload ${file.name}: ${errorData.message}`);
          } catch (parseError) {
            console.error(
              `Failed to upload ${file.name} with status ${response.status}`
            );
            toast.error(
              `Failed to upload ${file.name}. Server returned ${response.status}`
            );
          }
        }
      } catch (error) {
        failCount++;
        // Check for timeout/abort errors
        if (error instanceof DOMException && error.name === "AbortError") {
          console.error(`Upload timed out for ${file.name}`);
          toast.error(
            `Upload timed out for ${file.name}. The file may be too large or the server is busy.`
          );
        } else {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(
            `Error uploading ${file.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      // Update progress
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);

    // Dismiss the loading toast
    toast.dismiss(toastId);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      setFiles([]);

      if (isNewUser) {
        setUploadComplete(true);
        toast.success("User setup complete!");
      } else {
        router.push(`/admin/personal-info/${userId}`);
      }
    }

    if (failCount > 0 && successCount === 0) {
      toast.error(
        `Failed to upload all ${failCount} file(s). Please check the console for details.`
      );
    } else if (failCount > 0) {
      toast.warning(
        `Failed to upload ${failCount} out of ${files.length} file(s).`
      );
    }
  };

  // Add a new function to complete the new user setup
  const handleCompleteSetup = () => {
    toast.success("User setup completed successfully!");

    // Refresh the admin pages to show the updated user data
    router.refresh();

    // Navigate back to the personal info page
    router.push(`/admin/personal-info/${userId}`);
  };

  const handleSkipUpload = () => {
    if (isNewUser) {
      toast.success("User setup completed successfully!");
    }
    router.refresh();
    router.push(`/admin/personal-info/${userId}`);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return "📷";
    } else if (fileType.includes("pdf")) {
      return "📄";
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return "📝";
    } else {
      return "📎";
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
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
        {isNewUser && !uploadComplete && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-700">
              Final Step: Add Documents
            </h2>
            <p className="text-blue-600 mt-1">
              Upload verification documents for this user. You can skip this
              step if no documents are required.
            </p>
          </div>
        )}

        {isNewUser && uploadComplete && (
          <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-green-700">
                User Setup Complete
              </h2>
              <p className="text-green-600 mt-1">
                The user account has been successfully created and documents
                have been uploaded.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {isNewUser ? "Upload Documents" : "Upload Files"}
            </h1>
            {user && (
              <p className="text-slate-600">
                {user.name} - {user.email}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {isNewUser ? (
              <>
                <Button
                  onClick={() =>
                    router.push(`/admin/personal-info/${userId}/edit?new=true`)
                  }
                  variant="link"
                  className="text-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Profile
                </Button>
                {uploadComplete && (
                  <Button
                    onClick={handleCompleteSetup}
                    className="text-sm"
                    variant="link"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Complete Setup
                  </Button>
                )}
              </>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Upload personal files and documents for this user. Supported
              formats: PDF, DOCX, JPG, PNG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-10 w-10 text-slate-400" />
                <p className="text-slate-600 font-medium">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-slate-500 text-sm">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-900 mb-2">
                  Selected Files ({files.length})
                </h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getFileIcon(file.type)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uploading && (
              <div className="mt-6">
                <p className="text-sm text-slate-600 mb-2">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleSkipUpload}
            >
              Cancel
            </Button>
            {isNewUser && files.length === 0 && !uploadComplete && (
              <Button variant="link" onClick={handleSkipUpload}>
                Skip Document Upload
              </Button>
            )}
            {isNewUser && files.length > 0 && !uploading && !uploadComplete && (
              <Button variant="secondary" onClick={handleSkipUpload}>
                Skip Upload
              </Button>
            )}
            {!isNewUser && files.length > 0 && !uploading && (
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            )}
            {isNewUser && files.length > 0 && !uploading && !uploadComplete && (
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            )}
            {isNewUser && uploadComplete && (
              <div>
                <Button onClick={handleCompleteSetup}>
                  <Check className="mr-2 h-4 w-4" />
                  Complete Setup
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
