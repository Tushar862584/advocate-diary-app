import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, initializeStorage } from "@/lib/supabase";

// A simpler version of getUniqueFileName
const getTestFileName = () => {
  const timestamp = Date.now();
  return `test_file_${timestamp}.txt`;
};

export async function POST(req: NextRequest) {
  try {
    console.log("Test upload endpoint called");
    
    // Make sure storage is initialized
    console.log("Initializing storage for test");
    try {
      await initializeStorage();
    } catch (storageError) {
      console.error("Storage initialization error:", storageError);
      return NextResponse.json({
        success: false,
        message: "Failed to initialize storage",
        error: storageError instanceof Error ? storageError.message : "Unknown error"
      }, { status: 500 });
    }
    
    // Generate a simple test file
    const testContent = "This is a test file for Supabase storage";
    const testFileName = getTestFileName();
    const testFolder = "test-uploads";
    
    console.log(`Uploading test file: ${testFileName} to folder: ${testFolder}`);
    
    // Convert string to Uint8Array for Supabase
    const encoder = new TextEncoder();
    const fileData = encoder.encode(testContent);
    
    // Try to upload to Supabase
    console.log("Attempting upload to Supabase...");
    
    try {
      // Try to upload to case-files bucket
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("case-files")
        .upload(`${testFolder}/${testFileName}`, fileData, {
          contentType: "text/plain",
        });
        
      if (uploadError) {
        console.error("Test upload error:", uploadError);
        return NextResponse.json({
          success: false,
          message: "Failed to upload test file",
          error: uploadError
        }, { status: 500 });
      }
      
      console.log("Test upload successful:", uploadData);
      
      // Try to get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("case-files")
        .getPublicUrl(`${testFolder}/${testFileName}`);
        
      return NextResponse.json({
        success: true,
        message: "Test file uploaded successfully",
        fileName: testFileName,
        uploadData,
        publicUrl: urlData?.publicUrl
      });
    } catch (error) {
      console.error("Unexpected upload error:", error);
      return NextResponse.json({
        success: false,
        message: "Unexpected error during upload test",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("General test upload error:", error);
    return NextResponse.json({
      success: false,
      message: "Test upload failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 