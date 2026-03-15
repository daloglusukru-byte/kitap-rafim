import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PDFViewerClientWrapper } from "@/components/pdf-viewer-wrapper";

export default async function BookReaderPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  
  // Supabase'den kitabı çek
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !book) {
    console.error("Kitap bulunamadı:", error);
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Reader Header */}
      <header className="flex-none h-14 border-b border-border/50 bg-secondary/30 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-3 border-l border-border/50 pl-4">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold tracking-tight leading-tight line-clamp-1">
                {book.title}
              </h1>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {book.author || "Bilinmeyen Yazar"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </header>

      {/* PDF Viewer Area */}
      <main className="flex-1 relative flex bg-muted/30 overflow-hidden">
        <PDFViewerClientWrapper bookId={book.id} driveFileId={book.drive_file_id} />
      </main>
    </div>
  );
}
