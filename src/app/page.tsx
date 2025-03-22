import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
    return null;
  }
  
  // Redirect based on user role
  if (session.user?.role === "ADMIN") {
    redirect("/admin");
    return null;
  } else {
    redirect("/cases");
    return null;
  }
}
