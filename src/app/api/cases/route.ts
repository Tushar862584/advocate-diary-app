import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Define types for the request data
interface PetitionerInput {
  name: string;
  advocate?: string | null;
}

interface RespondentInput {
  name: string;
  advocate?: string | null;
}

interface CreateCaseInput {
  caseType: string;
  registrationNum: number;
  registrationYear: number;
  title?: string;
  courtName: string;
  userId?: string;
  petitioners: PetitionerInput[];
  respondents: RespondentInput[];
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json() as CreateCaseInput;
    
    // Validate input
    if (!data.caseType || !data.registrationNum || !data.registrationYear) {
      return NextResponse.json(
        { error: "Case type, registration number, and year are required" },
        { status: 400 }
      );
    }

    // Validate at least one petitioner and respondent
    if (!data.petitioners?.length || !data.respondents?.length) {
      return NextResponse.json(
        { error: "At least one petitioner and one respondent are required" },
        { status: 400 }
      );
    }

    // Ensure user can only create cases for themselves unless admin
    const isAdmin = session.user.role === "ADMIN";
    const userId = isAdmin && data.userId ? data.userId : session.user.id;

    // Generate title if not provided
    if (!data.title && data.petitioners.length > 0 && data.respondents.length > 0) {
      data.title = `${data.petitioners[0].name} vs ${data.respondents[0].name}`;
    }

    // Create case with petitioners and respondents
    const newCase = await prisma.case.create({
      data: {
        caseType: data.caseType,
        registrationNum: data.registrationNum,
        registrationYear: data.registrationYear,
        title: data.title || "",
        courtName: data.courtName,
        userId: userId,
        
        // Create petitioners
        petitioners: {
          create: data.petitioners.map((p) => ({
            name: p.name,
            advocate: p.advocate,
          })),
        },
        
        // Create respondents
        respondents: {
          create: data.respondents.map((r) => ({
            name: r.name,
            advocate: r.advocate,
          })),
        },
      },
      include: {
        petitioners: true,
        respondents: true,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the case" },
      { status: 500 }
    );
  }
}

// GET /api/cases - Get all cases (for admin) or user's cases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    // Parse URL to get query parameters
    const url = new URL(request.url);
    const includePERSONAL = url.searchParams.get('includePERSONAL') === 'true';
    
    // Get cases based on user role, filtering out PERSONAL cases for admin unless explicitly requested
    const cases = await prisma.case.findMany({
      where: isAdmin 
        ? includePERSONAL 
          ? {} // Include all cases if explicitly requested
          : { caseType: { not: 'PERSONAL' } } // Filter out PERSONAL cases for admin by default
        : { userId: session.user.id }, // Users always see all their own cases including PERSONAL
      include: {
        petitioners: true,
        respondents: true,
        hearings: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching cases" },
      { status: 500 }
    );
  }
}
