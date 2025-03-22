import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import UserTable from "./user-table";
import CreateUserForm from "./create-user-form";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }
  
  // Fetch all users from the database
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>
      
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Create New User</h3>
        <CreateUserForm />
      </div>
      
      <div className="rounded-lg border bg-white shadow-sm">
        <h3 className="border-b px-6 py-4 text-lg font-medium">All Users</h3>
        <UserTable users={users} />
      </div>
    </div>
  );
} 