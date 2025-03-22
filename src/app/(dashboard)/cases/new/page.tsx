import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NewCaseForm from "./new-case-form";

export default async function NewCasePage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Add New Case</h1>
        <p className="text-gray-700">
          Enter the details below to create a new case in your records.
        </p>
      </div>

      <NewCaseForm userId={session.user.id} />
    </div>
  );
} 