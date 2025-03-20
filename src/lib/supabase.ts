import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please check your .env file.');
}

// Create a Supabase client for server-side operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create a Supabase client for client-side operations (with anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Supabase storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'case-files');

    // Create bucket if it doesn't exist
    if (!bucketExists) {
      const { data, error } = await supabaseAdmin.storage.createBucket('case-files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket "case-files" created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing Supabase storage:', error);
  }
}; 