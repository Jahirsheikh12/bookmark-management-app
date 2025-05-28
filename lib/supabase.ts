import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getSupabaseServerClient = async () => {
  const { createServerComponentClient } = await import(
    "@supabase/auth-helpers-nextjs"
  );
  const { cookies } = await import("next/headers");
  return createServerComponentClient({ cookies });
};
