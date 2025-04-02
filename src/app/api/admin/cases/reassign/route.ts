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

    // Validate target user ID
    if (!targetUserId) {
      return NextResponse.json(
        { message: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "Target user not found" },
        { status: 404 }
      );
    }

    // Handle reassignment based on source
    if (sourceUserId === null) {
      // Use Prisma's raw query to find unassigned cases (excluding PERSONAL)
      const unassignedCaseIds = await prisma.$queryRaw`
        SELECT id FROM "Case" WHERE "userId" IS NULL AND "caseType" != 'PERSONAL'
      `;

      // No unassigned cases found
      if (!Array.isArray(unassignedCaseIds) || unassignedCaseIds.length === 0) {
        return NextResponse.json({
          message: `No unassigned cases found to assign to ${targetUser.name}`,
          count: 0,
        });
      }

      // Extract the IDs
      const caseIds = unassignedCaseIds.map((c: any) => c.id);

      // Update each unassigned case
      const result = await prisma.case.updateMany({
        where: {
          id: {
            in: caseIds,
          },
        },
        data: { userId: targetUserId },
      });

      return NextResponse.json({
        message: `${result.count} unassigned case(s) have been assigned to ${targetUser.name}`,
        count: result.count,
      });
    } else {
      // Verify source user exists
      const sourceUser = await prisma.user.findUnique({
        where: { id: sourceUserId },
      });

      if (!sourceUser) {
        return NextResponse.json(
          { message: "Source user not found" },
          { status: 404 }
        );
      }

      // Special handling when admin is transferring their own cases
      const isAdminTransferringOwnCases = sourceUserId === session.user.id;

      // Get total count of cases before transfer (for reporting)
      const totalCasesCount = await prisma.case.count({
        where: { userId: sourceUserId },
      });

      let result;

      // Determine if we need to filter out PERSONAL cases
      if (isAdminTransferringOwnCases) {
        // If admin is transferring their own cases, exclude PERSONAL cases
        result = await prisma.case.updateMany({
          where: {
            userId: sourceUserId,
            caseType: { not: "PERSONAL" },
          },
          data: { userId: targetUserId },
        });
      } else {
        // Standard transfer of all cases
        result = await prisma.case.updateMany({
          where: { userId: sourceUserId },
          data: { userId: targetUserId },
        });
      }

      // Create appropriate message based on whether PERSONAL cases were excluded
      const message = `${result.count} case(s) have been reassigned from ${sourceUser.name} to ${targetUser.name}`;

      // Return success response
      return NextResponse.json({
        message,
        count: result.count,
        totalCasesCount,
        excludedPersonalCases: isAdminTransferringOwnCases
          ? totalCasesCount - result.count
          : 0,
      });
    }
  } catch (error) {
    console.error("Error reassigning cases:", error);
    return NextResponse.json(
      { message: "An error occurred while reassigning cases" },
      { status: 500 }
    );
  }
}
