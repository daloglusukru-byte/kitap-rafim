import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for large folders

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Category keywords for auto-classification based on filename
const CATEGORY_RULES: Record<string, string[]> = {
  "Felsefe": ["felsefe", "philosophy", "platon", "aristoteles", "sokrat", "nietzsche", "kant", "marx", "hegel", "metafizik", "ontoloji", "epistemoloji", "etik", "mantık", "felsefi"],
  "Tarih": ["tarih", "history", "osmanlı", "ottoman", "savaş", "war", "imparatorluk", "devlet", "padişah", "sultan", "cumhuriyet", "atatürk", "türk tarihi", "dünya tarihi", "çanakkale", "roma", "antik"],
  "Din & Tasavvuf": ["kuran", "quran", "hadis", "sünnet", "islam", "tasavvuf", "sufi", "mevlana", "cevşen", "dua", "namaz", "fıkıh", "tefsir", "siyer", "peygamber", "allah", "risale", "ilmihal", "geylani", "atiyye", "sübhaniye", "imam", "şerh"],
  "Sağlık": ["sağlık", "health", "tıp", "medicine", "anatomi", "anatomy", "psikoloji", "psychology", "beslenme", "nutrition", "fitness", "yoga", "terapi"],
  "Eğitim": ["eğitim", "education", "pedagoji", "öğretim", "müfredat", "okul", "üniversite", "sınav", "ders"],
  "Bilim": ["bilim", "science", "fizik", "physics", "kimya", "chemistry", "biyoloji", "biology", "matematik", "math", "astronomi", "uzay", "genetik"],
  "Edebiyat": ["roman", "novel", "hikaye", "şiir", "poem", "poetry", "edebiyat", "literature", "öykü", "divan", "eser"],
  "Kişisel Gelişim": ["kişisel gelişim", "self-help", "motivasyon", "başarı", "liderlik", "leadership", "alışkanlık", "mindset", "pozitif"],
  "Ekonomi & İş": ["ekonomi", "economy", "finans", "finance", "yatırım", "invest", "borsa", "stock", "iş", "business", "girişim", "startup", "pazarlama", "marketing"],
  "Hukuk": ["hukuk", "law", "kanun", "anayasa", "ceza", "medeni", "ticaret hukuku"],
  "Teknoloji": ["teknoloji", "technology", "yazılım", "software", "programlama", "coding", "bilgisayar", "computer", "yapay zeka", "ai", "robot"],
};

function classifyBook(filename: string): string {
  const lower = filename.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return "Genel";
}

function cleanTitle(filename: string): { title: string; author: string | null } {
  // Remove file extension
  let name = filename.replace(/\.(pdf|PDF)$/, '').trim();
  
  // Common patterns: "Author - Title", "Author_Title", "Title (Author)"
  let author: string | null = null;
  
  // Pattern: "Author - Title"
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    author = parts[0].trim();
    name = parts.slice(1).join(' - ').trim();
  }
  // Pattern: "Title (Author)"  
  else if (name.match(/\(([^)]+)\)$/)) {
    const match = name.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (match) {
      name = match[1].trim();
      author = match[2].trim();
    }
  }
  
  // Replace underscores with spaces
  name = name.replace(/_/g, ' ');
  
  return { title: name, author };
}

// Recursively scan a Google Drive folder via the public API
async function scanDriveFolder(folderId: string, apiKey: string, pageToken?: string): Promise<any[]> {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', `'${folderId}' in parents and trashed = false`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size)');
  url.searchParams.set('pageSize', '1000');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Drive API Error ${response.status}: ${error}`);
  }
  
  const data = await response.json();
  let files = data.files || [];
  
  // Handle pagination
  if (data.nextPageToken) {
    const moreFiles = await scanDriveFolder(folderId, apiKey, data.nextPageToken);
    files = files.concat(moreFiles);
  }
  
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderId, apiKey } = body;
    
    if (!folderId) {
      return NextResponse.json({ error: "folderId gerekli" }, { status: 400 });
    }
    
    // If no API key, try scraping approach
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Google Drive API Key gerekli. Google Cloud Console'dan ücretsiz alabilirsiniz.",
        help: "https://console.cloud.google.com/apis/credentials" 
      }, { status: 400 });
    }
    
    console.log(`[Import] Scanning Drive folder: ${folderId}`);
    
    // Scan the folder
    const allFiles = await scanDriveFolder(folderId, apiKey);
    
    // Filter only PDF files
    const pdfFiles = allFiles.filter((f: any) => 
      f.mimeType === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    
    // Also get subfolders for recursive scanning
    const subfolders = allFiles.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
    
    console.log(`[Import] Found ${pdfFiles.length} PDFs and ${subfolders.length} subfolders`);
    
    // Get existing books to avoid duplicates
    const { data: existingBooks } = await supabase
      .from('books')
      .select('drive_file_id');
    const existingIds = new Set((existingBooks || []).map((b: any) => b.drive_file_id));
    
    // Process PDFs
    const newBooks = [];
    const skippedBooks = [];
    
    for (const file of pdfFiles) {
      if (existingIds.has(file.id)) {
        skippedBooks.push(file.name);
        continue;
      }
      
      const { title, author } = cleanTitle(file.name);
      const category = classifyBook(file.name);
      
      newBooks.push({
        title,
        author,
        drive_file_id: file.id,
        cover_url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
        category,
      });
    }
    
    // Recursively scan subfolders
    for (const folder of subfolders) {
      const subFiles = await scanDriveFolder(folder.id, apiKey);
      const subPdfs = subFiles.filter((f: any) => 
        f.mimeType === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      
      for (const file of subPdfs) {
        if (existingIds.has(file.id)) {
          skippedBooks.push(file.name);
          continue;
        }
        
        const { title, author } = cleanTitle(file.name);
        // Use subfolder name as category if available, otherwise auto-classify
        const category = folder.name || classifyBook(file.name);
        
        newBooks.push({
          title,
          author,
          drive_file_id: file.id,
          cover_url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
          category,
        });
      }
    }
    
    // Batch insert into Supabase (in chunks of 100)
    let insertedCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < newBooks.length; i += 100) {
      const chunk = newBooks.slice(i, i + 100);
      const { data, error } = await supabase.from('books').insert(chunk).select();
      
      if (error) {
        console.error(`[Import] Batch error at ${i}:`, error);
        errors.push(`Batch ${Math.floor(i/100) + 1}: ${error.message}`);
      } else {
        insertedCount += (data?.length || 0);
      }
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        totalScanned: allFiles.length,
        pdfFound: pdfFiles.length + subfolders.reduce((a: number) => a, 0),
        newBooksAdded: insertedCount,
        duplicatesSkipped: skippedBooks.length,
        errors: errors.length,
      },
      categories: [...new Set(newBooks.map(b => b.category))],
      errors: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error: any) {
    console.error(`[Import] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
