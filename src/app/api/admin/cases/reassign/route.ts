import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// POST /api/admin/cases/reassign - Bulk reassign cases to a user
export async function POST(request: Request) {
  // Verify user is authenticated and is an admin
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Forbidden: Requires admin privileges" },
      { status: 403 }
    );
  }

  try {
    // Parse the request body
    const { sourceUserId, targetUserId } = await request.json();

    // Validate the request
    if (!sourceUserId || !targetUserId) {
      return NextResponse.json(
        { message: "Both source and target user IDs are required" },
        { status: 400 }
      );
    }

    // Verify both users exist
    const sourceUser = await prisma.user.findUnique({
      where: { id: sourceUserId },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!sourceUser || !targetUser) {
      return NextResponse.json(
        { message: "One or both users not found" },
        { status: 404 }
      );
    }

    // Update all cases from source user to target user
    const result = await prisma.case.updateMany({
      where: { userId: sourceUserId },
      data: { userId: targetUserId },
    });

    // Return success response
    return NextResponse.json({
      message: `${result.count} case(s) have been reassigned from ${sourceUser.name} to ${targetUser.name}`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error reassigning cases:", error);
    return NextResponse.json(
      { message: "An error occurred while reassigning cases" },
      { status: 500 }
    );
  }
}
