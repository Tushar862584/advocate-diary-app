import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { supabaseAdmin, initializeStorage } from "@/lib/supabase";

// Helper to get current Unix timestamp to ensure unique filenames
const getUniqueFileName = (originalName: string) => {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const baseName = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9]/g, "_");
  
  return `${baseName}_${timestamp}.${extension}`;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // Extract caseId from params
    const { caseId } = params;
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the case and verify ownership (unless admin)
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to add to this case
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && caseData.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Initialize storage bucket
    await initializeStorage();

    // Parse form data (file)
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Create a unique file name
    const fileName = getUniqueFileName(file.name);
    
    // Get file buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("case-files")
      .upload(`${caseId}/${fileName}`, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { message: "Error uploading file to storage: " + error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicURLData } = supabaseAdmin.storage
      .from("case-files")
      .getPublicUrl(`${caseId}/${fileName}`);

    // Save file info to database
    const upload = await prisma.upload.create({
      data: {
        fileName: file.name,
        fileUrl: publicURLData.publicUrl,
        fileType: file.type,
        caseId,
        userId: session.user.id
      },
    });

    return NextResponse.json({ 
      message: "File uploaded successfully",
      upload 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
