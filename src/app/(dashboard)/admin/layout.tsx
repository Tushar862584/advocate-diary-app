import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8 border-b pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        {/*
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link
            href="/admin/users"
            className="rounded-md bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white hover:bg-blue-700"
          >
            User Management
          </Link>
          <Link
            href="/admin/cases"
            className="rounded-md bg-blue-100 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-blue-700 hover:bg-blue-200"
          >
            Case Management
          </Link>
          <Link
            href="/cases"
            className="rounded-md border border-gray-300 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-50"
          >
            View Cases
          </Link>
        </div>
        */}
      </div>

      {children}
    </div>
  );
}
