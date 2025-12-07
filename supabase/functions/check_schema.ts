// check_vendors_schema.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .limit(1);

console.log('Vendor sample:', data);
console.log('Error:', error);
