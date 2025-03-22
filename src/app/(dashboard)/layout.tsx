// SERVER COMPONENT
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardClientWrapper } from "@/components/dashboard/client";

export const metadata: Metadata = {
  title: "Advocate Diary - Dashboard",
  description: "Your legal case management solution",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server session here on the server
  const session = await getServerSession(authOptions);
  
  if (!session) {
    // Redirect to login if no session exists
    redirect("/login");
  }

  const isAdmin = session.user?.role === "ADMIN";
  
  // Pass the session and children to client component
  return <DashboardClientWrapper>{children}</DashboardClientWrapper>;
} 