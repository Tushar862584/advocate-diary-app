import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// POST /api/cases/[caseId]/assign - Assign a case to a different user
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can assign cases
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can assign cases" },
        { status: 403 }
      );
    }
    
    const { caseId } = await Promise.resolve(params);
    const { userId } = await request.json();
    
    // Validate userId field since it's required in the schema
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    
    // Check if case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, userId: true }
    });
    
    if (!caseExists) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if the case is already assigned to the requested user
    if (caseExists.userId === userId) {
      return NextResponse.json({
        success: true,
        message: "Case is already assigned to this user",
        case: await prisma.case.findUnique({
          where: { id: caseId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          }
        })
      });
    }
    
    // Update the case owner
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { 
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }
    });
    
    // Get counts of preserved notes and files
    const preservedNotesCount = await prisma.note.count({
      where: { 
        caseId,
        userId: { not: userId }
      }
    });
    
    const preservedFilesCount = await prisma.upload.count({
      where: { 
        caseId,
        userId: { not: userId }
      }
    });
    
    let preservationMessage = "";
    if (preservedNotesCount > 0 || preservedFilesCount > 0) {
      preservationMessage = `Previous content preserved: ${preservedNotesCount} notes and ${preservedFilesCount} files from former assignees remain accessible.`;
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Case assigned successfully. ${preservationMessage}`,
      case: updatedCase,
      preservedItems: {
        notes: preservedNotesCount,
        files: preservedFilesCount
      }
    });
  } catch (error) {
    console.error("Error assigning case:", error);
    return NextResponse.json(
      { error: "An error occurred while assigning the case" },
      { status: 500 }
    );
  }
} 