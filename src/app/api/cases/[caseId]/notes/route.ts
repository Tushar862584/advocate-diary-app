import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Add this temporary test endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the caseId from params
    const { caseId } = params;

    // Get the case and verify it exists
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to add notes to this case
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse request body
    const { content } = await req.json();
    
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { message: "Note content is required" },
        { status: 400 }
      );
    }

    // Create the note
    const note = await prisma.note.create({
      data: {
        content,
        caseId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the caseId from params
    const { caseId } = params;

    // Get the case
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this case
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Get all notes for the case
    const notes = await prisma.note.findMany({
      where: {
        caseId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 