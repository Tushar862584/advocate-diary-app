import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, initializeStorage } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Test connection to Supabase
    console.log("Testing Supabase connection");
    
    // Check API connection
    const { data: healthData, error: healthError } = await supabaseAdmin.functions.invoke("health-check");
    
    if (healthError) {
      console.error("Supabase health check error:", healthError);
      return NextResponse.json({
        status: "error",
        message: "Supabase health check failed",
        error: healthError
      }, { status: 500 });
    }
    
    // List buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return NextResponse.json({
        status: "error",
        message: "Failed to list buckets",
        error: bucketsError
      }, { status: 500 });
    }
    
    // Try to initialize storage
    let initResult;
    try {
      initResult = await initializeStorage();
    } catch (error) {
      console.error("Storage initialization error:", error);
      return NextResponse.json({
        status: "error",
        message: "Storage initialization failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: "success",
      message: "Supabase connection test passed",
      buckets: buckets?.map(b => ({ name: b.name, id: b.id })) || [],
      storageInitialized: initResult
    });
  } catch (error) {
    console.error("Supabase test error:", error);
    return NextResponse.json({
      status: "error",
      message: "Supabase test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 