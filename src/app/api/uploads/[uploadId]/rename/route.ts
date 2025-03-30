import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { uploadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadId = params.uploadId;
    if (!uploadId) {
      return NextResponse.json(
        { error: "Upload ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body to get new file name
    const body = await request.json();
    const { fileName } = body;

    if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
      return NextResponse.json(
        { error: "Valid file name is required" },
        { status: 400 }
      );
    }

    // Get the upload to check ownership and permissions
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        case: true,
      },
    });

    if (!upload) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check permission to rename the file
    const userId = session.user.id as string;
    const isAdmin = session.user.role === "ADMIN";

    // Different permission logic based on whether it's a personal file or case file
    if (upload.caseId && upload.case) {
      // Case file: check if user owns the case
      const isCaseOwner = upload.case.userId === userId;
      if (!isAdmin && !isCaseOwner) {
        return NextResponse.json(
          { error: "You don't have permission to rename this file" },
          { status: 403 }
        );
      }
    } else {
      // Personal file: check if user owns the file
      if (!isAdmin && upload.userId !== userId) {
        return NextResponse.json(
          { error: "You don't have permission to rename this file" },
          { status: 403 }
        );
      }
    }

    // Update the file name in the database
    const updatedUpload = await prisma.upload.update({
      where: { id: uploadId },
      data: { fileName: fileName.trim() },
    });

    return NextResponse.json({ 
      success: true,
      upload: updatedUpload
    });
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 }
    );
  }
} 