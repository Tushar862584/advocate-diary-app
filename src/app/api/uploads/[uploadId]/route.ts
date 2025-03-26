import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
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

    // Get the upload first to check ownership and get file details
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        case: true,
      },
    });

    if (!upload) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check permission to delete the file
    const userId = session.user.id as string;
    const isAdmin = session.user.role === "ADMIN";
    
    // Different permission logic based on whether it's a personal file or case file
    if (upload.caseId && upload.case) {
      // Case file: check if user owns the case
      const isCaseOwner = upload.case.userId === userId;
      if (!isAdmin && !isCaseOwner) {
        return NextResponse.json(
          { error: "You don't have permission to delete this file" },
          { status: 403 }
        );
      }
    } else {
      // Personal file: check if user owns the file
      if (!isAdmin && upload.userId !== userId) {
        return NextResponse.json(
          { error: "You don't have permission to delete this file" },
          { status: 403 }
        );
      }
    }

    console.log("Starting to delete file:", upload.fileUrl);

    // Determine which bucket the file is in
    let bucketName = "case-files";
    let pathMatch;
    
    if (upload.fileUrl.includes("personal-files")) {
      bucketName = "personal-files";
      pathMatch = upload.fileUrl.match(/personal-files\/([^?#]+)/);
    } else {
      pathMatch = upload.fileUrl.match(/case-files\/([^?#]+)/);
    }

    if (!pathMatch) {
      console.error("Failed to extract file path from URL:", upload.fileUrl);
      // If we can't parse the URL, we'll still delete the database record
      await prisma.upload.delete({
        where: { id: uploadId },
      });
      return NextResponse.json({ success: true });
    }

    const filePath = pathMatch[1];
    console.log(`Deleting file path: ${filePath} from bucket: ${bucketName}`);

    // Delete the file from Supabase Storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
      // We'll still delete the database record even if storage deletion fails
    }

    // Delete the upload record from the database
    await prisma.upload.delete({
      where: { id: uploadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
