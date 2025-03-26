import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Log Supabase configuration status (without exposing the actual keys)
console.log(`Supabase URL available: ${!!supabaseUrl}`);
console.log(`Supabase Service Role Key available: ${!!supabaseServiceKey}`);
console.log(`Supabase Anon Key available: ${!!supabaseAnonKey}`);

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Please check your .env file."
  );
  
  // Log which specific variables are missing
  if (!supabaseUrl) console.error("NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!supabaseServiceKey) console.error("SUPABASE_SERVICE_ROLE_KEY is missing");
  if (!supabaseAnonKey) console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
}

// Create a Supabase client for server-side operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl || "", supabaseServiceKey || "");

// Create a Supabase client for client-side operations (with anon key)
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Initialize Supabase storage buckets if they don't exist
export async function initializeStorage() {
  try {
    console.log("Starting initializeStorage function");
    
    // Verify Supabase credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials missing. Cannot initialize storage.");
    }
    
    // Check if buckets already exist
    console.log("Listing existing buckets...");
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw bucketsError;
    }
    
    if (!buckets) {
      console.error("No buckets data returned from Supabase");
      throw new Error("Failed to retrieve buckets from Supabase");
    }
    
    console.log("Existing buckets:", buckets.map(b => b.name).join(", "));
    
    // Create case-files bucket if it doesn't exist
    if (!buckets.find(bucket => bucket.name === "case-files")) {
      console.log("Creating case-files bucket");
      const { data: caseFilesData, error: caseFilesError } = await supabaseAdmin.storage.createBucket("case-files", {
        public: true,
      });
      
      if (caseFilesError) {
        console.error("Error creating case-files bucket:", caseFilesError);
        throw caseFilesError;
      }
      console.log("case-files bucket created successfully", caseFilesData);
    } else {
      console.log("case-files bucket already exists");
    }
    
    // Create personal-files bucket if it doesn't exist
    if (!buckets.find(bucket => bucket.name === "personal-files")) {
      console.log("Creating personal-files bucket");
      const { data: personalFilesData, error: personalFilesError } = await supabaseAdmin.storage.createBucket("personal-files", {
        public: true,
      });
      
      if (personalFilesError) {
        console.error("Error creating personal-files bucket:", personalFilesError);
        throw personalFilesError;
      }
      console.log("personal-files bucket created successfully", personalFilesData);
    } else {
      console.log("personal-files bucket already exists");
    }
    
    console.log("initializeStorage completed successfully");
    return true;
  } catch (error) {
    console.error("initializeStorage failed with error:", error);
    throw error;
  }
}
