import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createPersonalFileUpload } from "@/lib/db";
import { supabaseAdmin, initializeStorage } from "@/lib/supabase";

// Helper to get current Unix timestamp to ensure unique filenames
const getUniqueFileName = (originalName: string) => {
  const timestamp = Date.now();
  
  // Handle files with no extension
  if (!originalName.includes('.')) {
    return `file_${timestamp}`;
  }
  
  // Extract extension and base name, handling potential issues
  try {
    const extension = originalName.split(".").pop()?.toLowerCase() || "";
    
    // Clean the base name by removing problematic characters
    const baseName = originalName
      .substring(0, originalName.lastIndexOf("."))
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50); // Limit length of base name
    
    return `${baseName}_${timestamp}.${extension}`;
  } catch (error) {
    console.error("Error generating unique filename:", error);
    // Fallback to a simple name if there's an error
    return `file_${timestamp}`;
  }
};

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data (file and userId)
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Processing upload for user ${userId}. File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      console.log(`File type rejected: ${file.type}`);
      return NextResponse.json(
        { message: `Invalid file type: ${file.type}. Only JPG, PNG, PDF, DOC, and DOCX files are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log(`File size too large: ${file.size} bytes`);
      return NextResponse.json(
        { message: `File size exceeds the maximum limit of 10MB. Current size: ${Math.round(file.size / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }

    try {
      // Initialize storage bucket
      await initializeStorage();
      console.log("Storage buckets initialized");

      // Create a unique file name
      const fileName = getUniqueFileName(file.name);
      console.log(`Generated unique filename: ${fileName}`);
      
      // Get file buffer
      const buffer = await file.arrayBuffer();
      console.log(`File buffer created, size: ${buffer.byteLength} bytes`);

      // Upload to Supabase Storage in a 'personal-files' folder with the userId as a subfolder
      const { data, error } = await supabaseAdmin.storage
        .from("personal-files")
        .upload(`${userId}/${fileName}`, buffer, {
          contentType: file.type,
        });

      if (error) {
        console.error("Supabase storage error:", error);
        return NextResponse.json(
          { message: "Error uploading file to storage: " + error.message },
          { status: 500 }
        );
      }

      console.log(`File uploaded to Supabase, path: ${userId}/${fileName}`);

      // Get public URL
      const { data: publicURLData } = supabaseAdmin.storage
        .from("personal-files")
        .getPublicUrl(`${userId}/${fileName}`);

      if (!publicURLData || !publicURLData.publicUrl) {
        console.error("Failed to get public URL for uploaded file");
        return NextResponse.json(
          { message: "Failed to get public URL for uploaded file" },
          { status: 500 }
        );
      }

      console.log(`Public URL generated: ${publicURLData.publicUrl}`);

      // Use our custom helper to create the personal file upload
      const upload = await createPersonalFileUpload({
        fileName: file.name,
        fileUrl: publicURLData.publicUrl,
        fileType: file.type,
        userId: userId
      });

      console.log(`Upload record created in database with ID: ${upload.id}`);

      return NextResponse.json({ 
        message: "File uploaded successfully",
        upload 
      });
    } catch (uploadError) {
      console.error("Error in upload process:", uploadError);
      return NextResponse.json(
        { message: `Upload process error: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Global upload error:", error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 