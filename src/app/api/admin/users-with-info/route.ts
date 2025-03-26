import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma, getUsersWithInfo } from "@/lib/db";

export async function GET() {
  try {
    console.log("Starting GET /api/admin/users-with-info request");
    
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      console.log("Unauthorized access attempt to users-with-info endpoint");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const users = await getUsersWithInfo();
    console.log(`Successfully retrieved ${users.length} users with their data`);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users with info:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 