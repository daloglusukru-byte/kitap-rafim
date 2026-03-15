import { createClient } from "@supabase/supabase-js";

// Make sure to use NEXT_PUBLIC variables on the client side,
// but for server components, you can use regular env variables if needed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database tables
export interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  drive_file_id: string;
  total_pages: number | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string | null;
  book_id: string;
  current_page: number;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string | null;
  book_id: string;
  page: number;
  highlight_text: string | null;
  note_content: string | null;
  color: string;
  created_at: string;
}
