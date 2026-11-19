import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://myethvjjypjpreppxjuc.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_1Sh1CnMT7dt756VZWz8LlQ_klA7UvtP";

export const supabase = createClient(supabaseUrl, supabaseKey);
