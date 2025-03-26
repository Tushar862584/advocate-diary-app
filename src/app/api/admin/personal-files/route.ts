import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      console.log("Unauthorized access attempt to personal files");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get userId from query params
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      console.log("Missing userId parameter in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching personal files for user: ${userId}`);

    // First, find all PERSONAL cases for this user
    const personalCases = await prisma.case.findMany({
      where: {
        userId: userId,
        caseType: "PERSONAL"
      },
      select: {
        id: true
      }
    });

    console.log(`Found ${personalCases.length} personal cases for user ${userId}`);
    
    if (personalCases.length === 0) {
      console.log(`No personal cases found for user ${userId}`);
      return NextResponse.json({ 
        personalFiles: [],
      });
    }
    
    // Get the case IDs
    const personalCaseIds = personalCases.map(c => c.id);
    console.log(`Personal case IDs: ${personalCaseIds.join(', ')}`);
    
    // Find all uploads associated with these PERSONAL cases
    const personalFiles = await prisma.upload.findMany({
      where: {
        caseId: {
          in: personalCaseIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseType: true
          }
        }
      }
    });

    console.log(`Found ${personalFiles.length} personal files for user ${userId}`);

    return NextResponse.json({ 
      personalFiles,
    });
  } catch (error) {
    console.error("Error fetching personal files:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal files", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 