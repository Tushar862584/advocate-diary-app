"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  FileText,
  Download,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

// Types remain the same...

type PersonalInfo = {
  id: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  idNumber?: string | null;
  notes?: string | null;
  profileImage?: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  personalInfo: PersonalInfo | null;
  uploads: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    createdAt: string;
    caseId: string | null;
  }>;
};

export default function UserPersonalInfoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);

  // State for files, loading, etc.
  const [user, setUser] = useState<User | null>(null);
  const [personalFiles, setPersonalFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle scroll lock for mobile
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Helper function to check if scrolling is needed
    const needsScrollLock = () => {
      if (!pageRef.current) return false;
      return pageRef.current.scrollHeight > window.innerHeight;
    };

    // Apply scroll behavior
    const applyScrollBehavior = () => {
      // On mobile, we want to contain scrolling within our component
      if (window.innerWidth < 640 && needsScrollLock()) {
        document.body.style.overflow = "hidden";

        if (pageRef.current) {
          pageRef.current.style.height = "100vh";
          pageRef.current.style.overflowY = "auto";
          pageRef.current.style.WebkitOverflowScrolling = "touch";
        }
      } else {
        document.body.style.overflow = originalStyle;

        if (pageRef.current) {
          pageRef.current.style.height = "auto";
          pageRef.current.style.overflowY = "visible";
        }
      }
    };

    // Apply initially and on resize
    applyScrollBehavior();
    window.addEventListener("resize", applyScrollBehavior);

    // Fetch user data
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin/users/${userId}?includePersonal=true`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);

        // Set personal files if available
        if (userData.uploads) {
          setPersonalFiles(
            userData.uploads.filter((upload: any) => upload.caseId === null)
          );
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      // Cleanup scroll lock and event listener
      document.body.style.overflow = originalStyle;
      window.removeEventListener("resize", applyScrollBehavior);
    };
  }, [userId]);

  // Handle file deletion
  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/uploads/${selectedFile}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      // Update UI by removing the deleted file
      setPersonalFiles(
        personalFiles.filter((file) => file.id !== selectedFile)
      );

      toast.success("File deleted successfully");
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(false);
      setSelectedFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 font-medium">
          {error || "Failed to load user data"}
        </p>
        <Button
          onClick={() => router.push("/admin/personal-info")}
          variant="outline"
          className="mt-4"
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={pageRef}>
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm py-2 border-b border-slate-200 mb-4">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                {user.name}
              </h1>
              <p className="text-sm text-slate-600 truncate">{user.email}</p>
            </div>
            <Button
              onClick={() => router.push("/admin/personal-info")}
              variant="outline"
              size="sm"
              className="text-sm self-start sm:self-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Users
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 pb-4 sm:pb-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Contact and identification details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.personalInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Phone Number
                      </p>
                      <p className="mt-1 break-words">
                        {user.personalInfo.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        ID Number
                      </p>
                      <p className="mt-1 break-words">
                        {user.personalInfo.idNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Address
                    </p>
                    <p className="mt-1 break-words">
                      {user.personalInfo.address ? (
                        <>
                          {user.personalInfo.address}
                          {user.personalInfo.city &&
                            `, ${user.personalInfo.city}`}
                          {user.personalInfo.state &&
                            `, ${user.personalInfo.state}`}
                          {user.personalInfo.zipCode &&
                            ` ${user.personalInfo.zipCode}`}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Date of Birth
                    </p>
                    <p className="mt-1">
                      {user.personalInfo.dateOfBirth
                        ? format(new Date(user.personalInfo.dateOfBirth), "PPP")
                        : "Not provided"}
                    </p>
                  </div>

                  {user.personalInfo.notes && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Notes
                      </p>
                      <p className="mt-1 break-words whitespace-pre-wrap">
                        {user.personalInfo.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500">
                    No personal information provided
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  router.push(`/admin/personal-info/${userId}/edit`)
                }
                className="w-full sm:w-auto"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Information
              </Button>
            </CardFooter>
          </Card>

          {/* User Files Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Files</CardTitle>
              <CardDescription>
                Documents and files uploaded by the user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {personalFiles.length > 0 ? (
                <div className="space-y-3">
                  {personalFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(file.createdAt).toLocaleDateString()} •{" "}
                            {file.fileType.split("/")[1]}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1 self-end sm:self-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500"
                          onClick={() => window.open(file.fileUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300"
                          onClick={() => {
                            setSelectedFile(file.id);
                            setDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500">No personal files uploaded</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  router.push(`/admin/personal-info/${userId}/upload`)
                }
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFile}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
