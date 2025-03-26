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
    console.log(`Starting POST to add note to case: ${params.caseId}`);
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("Unauthorized - No valid session");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`Authenticated user: ${session.user.id} (${session.user.name})`);
    
    // Get the caseId from params
    const { caseId } = params;

    // Get the case and verify it exists
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      console.log(`Case not found: ${caseId}`);
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    console.log(`Case found: ${caseData.id}, userId: ${caseData.userId}`);
    
    // Check if user has permission to add notes to this case
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && caseData.userId !== session.user.id) {
      console.log(`Forbidden - User ${session.user.id} doesn't own case ${caseId}`);
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { content } = body;
    
    console.log(`Received note content: ${content ? 'Valid content' : 'Empty content'}`);
    
    if (!content || typeof content !== "string" || content.trim() === "") {
      console.log("Invalid note content");
      return NextResponse.json(
        { message: "Note content is required" },
        { status: 400 }
      );
    }

    // Create the note
    console.log("Creating note in database");
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

    console.log(`Note created successfully with ID: ${note.id}`);
    return NextResponse.json(note);
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
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