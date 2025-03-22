import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/cases/[caseId]/hearings - Create a new hearing
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const caseId = params.caseId;
    
    // Fetch the case to check if it exists
    const caseDetail = await prisma.case.findUnique({
      where: { id: caseId },
    });

    // Check if case exists
    if (!caseDetail) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the case
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = caseDetail.userId === session.user.id;
    
    // Only admin or owner can add hearings
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to add hearings to this case" },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.date) {
      return NextResponse.json(
        { error: "Hearing date is required" },
        { status: 400 }
      );
    }

    // Create the hearing
    const hearing = await prisma.hearing.create({
      data: {
        date: new Date(data.date),
        notes: data.notes,
        nextDate: data.nextDate ? new Date(data.nextDate) : null,
        nextPurpose: data.nextPurpose,
        caseId,
      },
    });

    return NextResponse.json(hearing, { status: 201 });
  } catch (error) {
    console.error("Error creating hearing:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the hearing" },
      { status: 500 }
    );
  }
}

// GET /api/cases/[caseId]/hearings - Get all hearings for a case
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const caseId = params.caseId;
    
    // Fetch the case to check if it exists
    const caseDetail = await prisma.case.findUnique({
      where: { id: caseId },
    });

    // Check if case exists
    if (!caseDetail) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the case
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = caseDetail.userId === session.user.id;
    
    // Only admin or owner can view hearings
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to view hearings for this case" },
        { status: 403 }
      );
    }

    // Fetch all hearings for the case
    const hearings = await prisma.hearing.findMany({
      where: { caseId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(hearings);
  } catch (error) {
    console.error("Error fetching hearings:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the hearings" },
      { status: 500 }
    );
  }
} 