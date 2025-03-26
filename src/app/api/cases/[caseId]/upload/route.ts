import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { supabaseAdmin, initializeStorage } from "@/lib/supabase";

// Helper to get current Unix timestamp to ensure unique filenames
const getUniqueFileName = (originalName: string) => {
  const timestamp = Date.now();
  
  // Handle files with no extension
  if (!originalName.includes('.')) {
    return `file_${timestamp}`;
  }
  
  const extension = originalName.split(".").pop()?.toLowerCase() || "";
  const baseName = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50); // Limit length of base name
  
  return `${baseName}_${timestamp}.${extension}`;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    console.log(`Starting file upload for case: ${params.caseId}`);
    
    // Extract caseId from params
    const { caseId } = await params;
    
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
    
    // Get the case and verify ownership (unless admin)
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

    // Check if user has permission to add to this case
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && caseData.userId !== session.user.id) {
      console.log(`Forbidden - User ${session.user.id} doesn't own case ${caseId}`);
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Initialize storage bucket
    console.log("Initializing storage buckets");
    try {
      await initializeStorage();
      console.log("Storage buckets initialized successfully");
    } catch (storageError) {
      console.error("Failed to initialize storage buckets:", storageError);
      return NextResponse.json(
        { 
          message: "Failed to initialize storage", 
          details: storageError instanceof Error ? storageError.message : "Unknown storage initialization error"
        },
        { status: 500 }
      );
    }

    // Parse form data (file)
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      console.log("No file provided in form data");
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { message: `Invalid file type: ${file.type}. Only JPG, PNG, PDF, DOC, and DOCX files are allowed.` },
        { status: 400 }
      );
    }

    // Create a unique file name
    const fileName = getUniqueFileName(file.name);
    console.log(`Generated unique filename: ${fileName}`);
    
    // Get file buffer
    let buffer;
    try {
      buffer = await file.arrayBuffer();
      console.log(`File buffer created, size: ${buffer.byteLength} bytes`);
    } catch (bufferError) {
      console.error("Failed to create file buffer:", bufferError);
      return NextResponse.json(
        { message: "Failed to process file", details: bufferError instanceof Error ? bufferError.message : "Unknown buffer error" },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    console.log(`Uploading to Supabase Storage bucket 'case-files/${caseId}/${fileName}'`);
    let data, error;
    try {
      const uploadResult = await supabaseAdmin.storage
        .from("case-files")
        .upload(`${caseId}/${fileName}`, buffer, {
          contentType: file.type,
        });
      
      data = uploadResult.data;
      error = uploadResult.error;
    } catch (uploadError) {
      console.error("Unexpected error during Supabase upload:", uploadError);
      return NextResponse.json(
        { 
          message: "Unexpected error during file upload", 
          details: uploadError instanceof Error ? uploadError.message : "Unknown upload error" 
        },
        { status: 500 }
      );
    }

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { message: "Error uploading file to storage", details: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    let publicURLData;
    try {
      const urlResult = supabaseAdmin.storage
        .from("case-files")
        .getPublicUrl(`${caseId}/${fileName}`);
      
      publicURLData = urlResult.data;
      
      if (!publicURLData || !publicURLData.publicUrl) {
        console.error("Failed to get public URL for uploaded file");
        return NextResponse.json(
          { message: "Failed to get public URL for uploaded file" },
          { status: 500 }
        );
      }
    } catch (urlError) {
      console.error("Error getting public URL:", urlError);
      return NextResponse.json(
        { message: "Failed to get file URL", details: urlError instanceof Error ? urlError.message : "Unknown URL error" },
        { status: 500 }
      );
    }

    console.log(`Public URL generated: ${publicURLData.publicUrl}`);

    // Save file info to database
    console.log("Creating upload record in database");
    let upload;
    try {
      upload = await prisma.upload.create({
        data: {
          fileName: file.name,
          fileUrl: publicURLData.publicUrl,
          fileType: file.type,
          caseId,
          userId: session.user.id
        },
      });
    } catch (dbError) {
      console.error("Database error while creating upload record:", dbError);
      return NextResponse.json(
        { message: "Database error while creating upload record", details: dbError instanceof Error ? dbError.message : "Unknown database error" },
        { status: 500 }
      );
    }

    console.log(`Upload record created with ID: ${upload.id}`);
    return NextResponse.json({ 
      message: "File uploaded successfully",
      upload 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
