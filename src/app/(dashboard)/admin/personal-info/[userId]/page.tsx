"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Edit,
  ArrowLeft,
  Upload,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { use } from "react";

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
  const pageRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [personalFiles, setPersonalFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Starting fetch for user ID: ${userId}`);

        // Fetch user details
        const userResponse = await fetch(`/api/admin/users/${userId}`);
        if (!userResponse.ok) {
          console.error(
            `Failed to fetch user details: ${userResponse.status} ${userResponse.statusText}`
          );
          toast.error("Failed to load user details");
          setLoading(false);
          return;
        }

        const userData = await userResponse.json();
        console.log("User data fetched:", userData);
        setUser(userData.user);

        // Fetch personal files
        console.log(`Fetching personal files for user: ${userId}`);
        const filesResponse = await fetch(
          `/api/admin/personal-files?userId=${userId}`
        );
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          console.log("Personal files response:", filesData);
          setPersonalFiles(filesData.personalFiles || []);
        } else {
          console.error(
            `Failed to fetch personal files: ${filesResponse.status} ${filesResponse.statusText}`
          );
          const errorText = await filesResponse.text();
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/uploads/${selectedFile}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File deleted successfully");
        // Remove the file from the state
        setPersonalFiles((prev) =>
          prev.filter((file) => file.id !== selectedFile)
        );
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("An error occurred while deleting the file");
    } finally {
      setDeleteConfirm(false);
      setSelectedFile(null);
      setIsDeleting(false);
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
              variant="link"
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
                          size="icon"
                          className="h-8 w-8 p-0 text-slate-500"
                          onClick={() => window.open(file.fileUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
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
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
