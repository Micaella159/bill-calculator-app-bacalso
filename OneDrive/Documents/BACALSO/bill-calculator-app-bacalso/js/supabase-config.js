// Supabase Configuration
const SUPABASE_URL = 'https://bvmwosgmxknumeoktvrp.supabase.co'; // Replace with your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bXdvc2dteGtudW1lb2t0dnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5OTY2NDAsImV4cCI6MjA4MDU3MjY0MH0.9PBP8pwNoZO264jQsrSjcSkDvdu4GRxhSO5hMLPwaq0'; // Replace with your anon key

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
