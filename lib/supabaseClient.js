import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aulypaonrlrougshxgvc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bHlwYW9ucmxyb3Vnc2h4Z3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzM1OTcsImV4cCI6MjA3MjEwOTU5N30.yMIc1Ge4ejDEacWGZ3h5RzeENI6No4rXDuAl-RenVmg'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '********' : 'MISSING');
