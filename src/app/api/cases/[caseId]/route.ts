import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET /api/cases/[caseId] - Get a specific case by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = params;

    // Get the case with details
    const caseDetail = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        petitioners: true,
        respondents: true,
        hearings: {
          orderBy: { date: "desc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Check if case exists
    if (!caseDetail) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if user is the owner or an admin
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = caseDetail.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You do not have permission to view this case" },
        { status: 403 }
      );
    }

    return NextResponse.json(caseDetail);
  } catch (error) {
    console.error("Error getting case:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the case" },
      { status: 500 }
    );
  }
}

// PUT /api/cases/[caseId] - Update a case
export async function PUT(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = params;
    const data = await request.json();

    // Get the case to verify ownership
    const caseDetail = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        userId: true,
      },
    });

    // Check if case exists
    if (!caseDetail) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if user is the owner or an admin
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = caseDetail.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You do not have permission to update this case" },
        { status: 403 }
      );
    }

    // Extract and validate the input
    const {
      caseType,
      registrationYear,
      registrationNum,
      title,
      courtName,
      petitioners,
      respondents,
      petitionersToDelete,
      respondentsToDelete,
      isCompleted,
    } = data;

    // Start a transaction
    const updatedCase = await prisma.$transaction(async (tx) => {
      // Update the case
      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          caseType,
          registrationYear,
          registrationNum,
          title,
          courtName,
          ...(isAdmin && isCompleted !== undefined ? { isCompleted } : {}),
        },
      });

      // Delete petitioners marked for deletion
      if (petitionersToDelete && petitionersToDelete.length > 0) {
        await tx.petitioner.deleteMany({
          where: {
            id: {
              in: petitionersToDelete,
            },
            caseId,
          },
        });
      }

      // Delete respondents marked for deletion
      if (respondentsToDelete && respondentsToDelete.length > 0) {
        await tx.respondent.deleteMany({
          where: {
            id: {
              in: respondentsToDelete,
            },
            caseId,
          },
        });
      }

      // Update existing and create new petitioners
      for (const petitioner of petitioners) {
        if (petitioner.isNew) {
          // Create new petitioner
          await tx.petitioner.create({
            data: {
              name: petitioner.name,
              // Use optional chaining to handle potentially null advocate field
              ...(petitioner.advocate ? { advocate: petitioner.advocate } : {}),
              case: {
                connect: { id: caseId },
              },
            },
          });
        } else if (petitioner.id) {
          // Update existing petitioner
          await tx.petitioner.update({
            where: { id: petitioner.id },
            data: {
              name: petitioner.name,
              // Use optional chaining to handle potentially null advocate field
              ...(petitioner.advocate ? { advocate: petitioner.advocate } : {}),
            },
          });
        }
      }

      // Update existing and create new respondents
      for (const respondent of respondents) {
        if (respondent.isNew) {
          // Create new respondent
          await tx.respondent.create({
            data: {
              name: respondent.name,
              // Use optional chaining to handle potentially null advocate field
              ...(respondent.advocate ? { advocate: respondent.advocate } : {}),
              case: {
                connect: { id: caseId },
              },
            },
          });
        } else if (respondent.id) {
          // Update existing respondent
          await tx.respondent.update({
            where: { id: respondent.id },
            data: {
              name: respondent.name,
              // Use optional chaining to handle potentially null advocate field
              ...(respondent.advocate ? { advocate: respondent.advocate } : {}),
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the case" },
      { status: 500 }
    );
  }
}

// PATCH /api/cases/[caseId] - Update specific fields of a case (currently only isCompleted)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update completion status
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can update case completion status" },
        { status: 403 }
      );
    }

    const { caseId } = await params;
    const data = await request.json();

    // Get the case to verify it exists
    const caseDetail = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        isCompleted: true,
      },
    });

    // Check if case exists
    if (!caseDetail) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Extract the isCompleted field from the request body
    const { isCompleted } = data;

    // Validate that isCompleted is a boolean
    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "isCompleted must be a boolean value" },
        { status: 400 }
      );
    }

    // Update only the isCompleted field
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { isCompleted },
      select: {
        id: true,
        isCompleted: true,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Error updating case completion status:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the case completion status" },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[caseId] - Delete a case
export async function DELETE(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = params;

    // Get the case to verify ownership
    const caseDetail = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        userId: true,
      },
    });

    // Check if case exists
    if (!caseDetail) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if user is the owner or an admin
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = caseDetail.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You do not have permission to delete this case" },
        { status: 403 }
      );
    }

    // Delete the case (cascade will handle related records)
    await prisma.case.delete({
      where: { id: caseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the case" },
      { status: 500 }
    );
  }
}
