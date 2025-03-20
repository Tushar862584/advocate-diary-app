import { Sidebar } from "@/components/layout/sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-800">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 bg-slate-800 text-slate-100">{children}</main>
    </div>
  );
} 