import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get a test case from the database
    const testCase = await prisma.case.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        userId: true
      }
    });

    if (!testCase) {
      return NextResponse.json({
        success: false,
        message: "No cases found in database for testing"
      }, { status: 404 });
    }

    // Try to get notes for this case
    const notes = await prisma.note.findMany({
      where: {
        caseId: testCase.id
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      testCase,
      notesCount: notes.length,
      notes
    });
  } catch (error) {
    console.error("Test notes error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to test notes functionality",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get a test case from the database
    const testCase = await prisma.case.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!testCase) {
      return NextResponse.json({
        success: false,
        message: "No cases found in database for testing"
      }, { status: 404 });
    }

    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN"
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!testUser) {
      return NextResponse.json({
        success: false,
        message: "No admin user found for testing"
      }, { status: 404 });
    }

    // Create a test note
    const testContent = `Test note created at ${new Date().toISOString()}`;
    
    const note = await prisma.note.create({
      data: {
        content: testContent,
        caseId: testCase.id,
        userId: testUser.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Test note created successfully",
      note,
      testCase: {
        id: testCase.id,
        title: testCase.title
      },
      testUser: {
        id: testUser.id,
        name: testUser.name
      }
    });
  } catch (error) {
    console.error("Test note creation error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create test note",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 