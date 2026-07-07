import { createClient } from '@supabase/supabase-js'

// Hardcoding the NEW keys directly here guarantees Vercel will never lose connection!
const supabaseUrl = "https://sewkjpcfrdgjfibrkqbq.supabase.co";
const supabaseAnonKey = "sb_publishable_aTB2jvWJmmyxiy-9GYMW6g_prJMWef5";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
