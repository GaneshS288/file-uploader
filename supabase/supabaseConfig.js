import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabaseClient;
