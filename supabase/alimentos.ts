import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pmqsrzljxvrnyvwyothc.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getAlimentos() {
    const { data } = await supabase.from("Alimentos").select("nombre");

    return data;
}
