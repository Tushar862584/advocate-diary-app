"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Eye, Edit, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

// Add case property to the Upload type
type Upload = {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  createdAt: string;
  caseId: string | null;
  case?: {
    id: string;
    caseType: string;
    title: string;
  } | null;
};

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
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  personalInfo: PersonalInfo | null;
  uploads: Array<Upload>;
};

export default function PersonalInfoManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch users with their personal information
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("Fetching users with personal info...");
        const response = await fetch("/api/admin/users-with-info");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Server responded with status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log(`Fetched ${data.users.length} users`);
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const personalFilesCount = (user: User) => {
    try {
      // Personal files are those that are associated with a case of type "PERSONAL"
      return (
        user.uploads?.filter(
          (upload) =>
            // Check if the upload has case information
            upload.case?.caseType === "PERSONAL" ||
            // For backwards compatibility, also check caseId
            // This will be removed once all records have proper case relations
            upload.caseId === null
        )?.length || 0
      );
    } catch (error) {
      console.error("Error counting personal files:", error);
      return 0;
    }
  };

  // For a cleaner UI display of contact info
  const getFormattedContactInfo = (info: PersonalInfo | null) => {
    if (!info) return null;

    const parts = [];
    if (info.phoneNumber) parts.push(info.phoneNumber);

    const addressParts = [];
    if (info.address) addressParts.push(info.address);
    if (info.city) addressParts.push(info.city);

    if (addressParts.length > 0) {
      parts.push(addressParts.join(", "));
    }

    if (info.state || info.zipCode) {
      parts.push([info.state, info.zipCode].filter(Boolean).join(" "));
    }

    return parts.length > 0 ? parts : null;
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Personal Information Management
            </h1>
            <p className="text-slate-700">
              View and manage user personal information and documents
            </p>
          </div>
          <Button
            onClick={() => router.push("/admin")}
            variant="link"
            className="text-sm w-full sm:w-auto text-slate-700 hover:text-slate-900 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-slate-700">Loading user information...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-white shadow rounded-lg">
            <div className="text-slate-700">No users found</div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Refresh
            </Button>
          </div>
        ) : (
          <>
            {/* Table for larger screens */}
            <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                      >
                        Contact Info
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                      >
                        Personal Files
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-slate-700 text-sm">
                                {user.name?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {user.personalInfo ? (
                            <div className="text-sm text-slate-600">
                              {getFormattedContactInfo(user.personalInfo)?.map(
                                (line, i) => <p key={i}>{line}</p>
                              ) || (
                                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                                  Limited information
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                              No information
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm text-slate-600">
                            {personalFilesCount(user) > 0 ? (
                              <span className="flex items-center">
                                <FileText
                                  size={16}
                                  className="mr-1 text-slate-600"
                                />
                                {personalFilesCount(user)} files
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                                No files
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button
                              onClick={() =>
                                router.push(`/admin/personal-info/${user.id}`)
                              }
                              variant="default"
                              size="sm"
                              className="text-blue-700 hover:text-blue-900 flex items-center"
                              title="View details"
                            >
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/admin/personal-info/${user.id}/edit`
                                )
                              }
                              variant="destructive"
                              size="sm"
                              className="text-amber-700 hover:text-amber-900 flex items-center"
                              title="Edit information"
                            >
                              <Edit size={16} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/admin/personal-info/${user.id}/upload`
                                )
                              }
                              variant="secondary"
                              size="sm"
                              className="text-green-700 hover:text-green-900 flex items-center"
                              title="Upload documents"
                            >
                              <Upload size={16} className="mr-1" />
                              Upload
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards for smaller screens */}
            <div className="block sm:hidden space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white shadow rounded-lg p-4 space-y-4"
                >
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-700 text-sm">
                        {user.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {user.name}
                      </h2>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="text-sm text-slate-600">
                    {getFormattedContactInfo(user.personalInfo)?.map(
                      (line, i) => <p key={i}>{line}</p>
                    ) || <p>No contact information</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-between items-center space-y-2 sm:space-y-0">
                    <p className="text-sm text-slate-600">
                      {personalFilesCount(user)} files
                    </p>
                    <div className="flex flex-wrap space-x-2">
                      <Button
                        onClick={() =>
                          router.push(`/admin/personal-info/${user.id}`)
                        }
                        variant="default"
                        size="sm"
                        className="text-blue-700 hover:text-blue-900 flex items-center"
                        title="View details"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/admin/personal-info/${user.id}/edit`)
                        }
                        variant="destructive"
                        size="sm"
                        className="text-amber-700 hover:text-amber-900 flex items-center"
                        title="Edit information"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/admin/personal-info/${user.id}/upload`)
                        }
                        variant="link"
                        size="sm"
                        className="text-green-700 hover:text-green-900 flex items-center"
                        title="Upload documents"
                      >
                        <Upload size={16} className="mr-1" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
