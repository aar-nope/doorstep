import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

// Server-only client — bypasses RLS rules
// Never import this in frontend/client components
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey)