
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log("Checking categories...");

const { data, error } = await supabase
    .from('vendors')
    .select('category');

if (error) {
    console.error("Error:", error);
} else {
    const categories = [...new Set(data.map((v: any) => v.category))];
    console.log("Distinct Categories in DB:", categories);
}
