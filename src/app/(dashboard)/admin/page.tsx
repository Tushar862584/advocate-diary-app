import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }
  
  // Instead of redirecting to users page, render dashboard content
  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <p className="mb-8 text-gray-600">Welcome to the admin dashboard. Manage users and cases from here.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="p-5">
            <h2 className="mb-3 text-lg font-semibold">User Management</h2>
            <p className="mb-4 text-sm text-gray-600">
              Create, edit, and delete user accounts. Manage access to the system.
            </p>
            <Link 
              href="/admin/users" 
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Manage Users
            </Link>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Case Management</h2>
            <p className="mb-4 text-sm text-gray-600">
              Assign cases to users, transfer cases between users, or handle unassigned cases.
            </p>
            <Link 
              href="/admin/cases" 
              className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Manage Cases
            </Link>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="p-5">
            <h2 className="mb-3 text-lg font-semibold">View All Cases</h2>
            <p className="mb-4 text-sm text-gray-600">
              See all cases in the system, including assigned and unassigned cases.
            </p>
            <Link 
              href="/cases" 
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              View Cases
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 