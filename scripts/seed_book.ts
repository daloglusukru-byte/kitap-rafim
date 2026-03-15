import { createClient } from "@supabase/supabase-js";
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const driveFileId = '1EZHNJ_2Aq59cB5PhuaKq0KD-q6qd42tC';
  console.log(`Inserting book with Drive ID: ${driveFileId}`);

  const { data, error } = await supabase
    .from('books')
    .insert([
      { 
        title: 'Abdulkadir Geylani - Atiyye-i Subhaniye', 
        author: 'Abdulkadir Geylani', 
        cover_url: 'https://images.unsplash.com/photo-1542871793-27e0fa0ce231?q=80&w=400',
        drive_file_id: driveFileId,
        total_pages: null
      }
    ])
    .select();

  if (error) {
    console.error('Error inserting book:', error);
  } else {
    console.log('Success! Book inserted:', data);
  }
}

main();
