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
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link 
            href="/admin/users" 
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            User Management
          </Link>
          <Link 
            href="/cases" 
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            View Cases
          </Link>
        </div>
      </div>
      
      {children}
    </div>
  );
} 