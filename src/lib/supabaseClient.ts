import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfgsdtwbbzvozzbxasok.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZ3NkdHdiYnp2b3p6Ynhhc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDQzMjAsImV4cCI6MjA2NjM4MDMyMH0.Dp_gJRubQqFZtTEQh3a5myRFLerpW7hmoZ2Iz4Qmqkk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
  },
});
