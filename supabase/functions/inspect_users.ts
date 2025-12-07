
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// 1. Get one user to see schema
const { data: sample, error: sampleError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

if (sampleError) {
    console.error("Error fetching sample user:", sampleError);
} else {
    console.log("Sample User Keys:", Object.keys(sample[0] || {}));
    console.log("Sample User Data:", sample[0]);
}

// 2. Count couples
const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'couple');

if (countError) {
    console.error("Error counting couples:", countError);
} else {
    console.log(`Found ${count} users with role 'couple'`);
}

// 3. List all roles to see what's available
const { data: roles, error: rolesError } = await supabase
    .from('users')
    .select('role');

if (rolesError) {
    console.error("Error fetching roles:", rolesError);
} else {
    const uniqueRoles = [...new Set(roles?.map(r => r.role))];
    console.log("Available roles:", uniqueRoles);
}
