
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log("Fetching distinct categories from 'vendors'...");

const { data: vendors, error } = await supabase
    .from('vendors')
    .select('category');

if (error) {
    console.error("Error:", error);
} else {
    // Get unique categories
    const categories = [...new Set(vendors.map((v: any) => v.category))].sort();
    console.log("Distinct Categories found:", categories);
}
