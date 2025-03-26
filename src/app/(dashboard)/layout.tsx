// SERVER COMPONENT
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardClientWrapper } from "@/components/dashboard/client";

export const metadata: Metadata = {
  title: "Advocate Diary",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
      <DashboardClientWrapper>
        <main className="min-h-screen p-0">
          <div className="mx-auto max-w-full md:max-w-7xl">
            <div className="bg-white sm:bg-white/70 sm:backdrop-blur-sm sm:shadow-sm sm:ring-1 sm:ring-gray-200/50 rounded-none sm:rounded-lg p-0.5 sm:p-3 md:p-6">
              {children}
            </div>
          </div>
        </main>
      </DashboardClientWrapper>
    </div>
  );
}
