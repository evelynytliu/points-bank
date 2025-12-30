const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFamilyCode(code) {
    console.log(`Checking code: "${code}"`);

    // 1. Check direct match (short_id) and return ALL matches
    const { data: familyShort, error: errShort } = await supabase
        .from('families')
        .select('id, short_id, created_at') // Added created_at to see which is newer
        .eq('short_id', code);

    if (errShort) console.error('Error checking short_id:', errShort);
    else {
        console.log(`Found ${familyShort.length} families with short_id "${code}":`);
        console.log(familyShort);
    }
}

checkFamilyCode('FAMILY4451');
