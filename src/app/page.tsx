import { ThemeSwitcher } from "@/components/theme-switcher";
import { BookOpen, Search, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Server component approach
export default async function Home() {
  // Fetch books from Supabase with a high limit to get all books
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    console.error("Kitaplar çekilirken hata oluştu:", error);
  }

  const allBooks = books || [];

  // Dinamik Kategori Atama Algoritması
  const CATEGORIES: Record<string, string[]> = {
    "Din & Tasavvuf": ["kuran","quran","hadis","sünnet","islam","tasavvuf","sufi","mevlana","cevşen","dua","namaz","fıkıh","tefsir","siyer","peygamber","allah","risale","ilmihal","geylani","atiyye","sübhaniye","imam","şerh","diyanet","müslüman","din ","din-","ihya","gazali","ibn","muhammed","kader","ilahi","mesnevi","hallac","mistik","kabala","ruhani","cami","tirmizi","buhari","müsned","ebu","enbiya"],
    "Felsefe & Düşünce": ["felsefe","philosophy","platon","aristoteles","sokrat","nietzsche","kant","marx","hegel","metafizik","ontoloji","epistemoloji","spinoza","russell","wittgenstein","descartes","felsefi","retorik","mantık","etik","stoa","kierkegaard","sartre","husserl","fenomenoloji","schopenhauer","bacon","locke","hume","popper"],
    "Tarih & Medeniyet": ["tarih","history","osmanlı","ottoman","savaş","war","imparatorluk","padişah","sultan","cumhuriyet","atatürk","çanakkale","roma","antik","devlet","hilafet","lozan","haçlı","kurtuluş","ismet","inönü","türkiye","medeniy","uygarlık","çöküş","millet","toynbee","lewis","şimşir","şengör","asırlar","istanbul"],
    "Psikoloji & Toplum": ["psikoloji","psikiyatri","freud","adler","jung","psikodrama","depresyon","travma","bilinçaltı","rüya","davranış","terapi","psiko","sosyoloji","davranış"],
    "Edebiyat & Şiir": ["roman","novel","hikaye","şiir","poem","edebiyat","öykü","christie","tolstoy","dostoye","çehov","baudelaire","dumas","coelho","kafka","balzac","dickens","hugo","steinbeck","hemingway","woolf","orwell","wilde","twain","austen"],
    "Kişisel Gelişim": ["kişisel gelişim","self-help","motivasyon","başarı","liderlik","alışkanlık","mindset","pozitif","mutlu","hissetmek","affet","bırak","rahatla","atomik","güneş"],
    "Ekonomi & İş": ["ekonomi","economy","finans","finance","yatırım","borsa","iş","business","girişim","startup","pazarlama","marketing","zenginlik","para"],  
    "Bilim & Teknoloji": ["bilim","science","fizik","physics","kimya","biyoloji","matematik","astronomi","uzay","genetik","evrim","beyin","nörobilim","newton","einstein"],
    "Siyaset & Araştırma": ["siyaset","politika","ideoloji","liberal","sosyalizm","komünizm","demokrasi","heywood","küresel siyaset","devrim","cia","istihbarat","casus","hükümet"],
    "Sağlık & Yaşam": ["sağlık","health","tıp","medicine","anatomi","anatomy","beslenme","nutrition","şifa","bitkiler","diyet","yoga","beden"]
  };

  const categorizedBooks: Record<string, any[]> = { "Yeni Eklenenler": allBooks.slice(0, 15) };
  
  if (allBooks.length > 0) {
    allBooks.forEach(book => {
      let assignedCategory = "Genel Kitaplar";
      const titleLower = book.title.toLowerCase();
      
      for (const [catName, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(kw => titleLower.includes(kw))) {
          assignedCategory = catName;
          break;
        }
      }
      
      if (!categorizedBooks[assignedCategory]) {
        categorizedBooks[assignedCategory] = [];
      }
      categorizedBooks[assignedCategory].push(book);
    });
  }

  // Rafları oluşturacağımız sıralama
  const shelfOrder = [
    "Yeni Eklenenler", 
    "Din & Tasavvuf", 
    "Felsefe & Düşünce", 
    "Tarih & Medeniyet", 
    "Edebiyat & Şiir", 
    "Psikoloji & Toplum",
    "Siyaset & Araştırma",
    "Ekonomi & İş",
    "Sağlık & Yaşam",
    "Kişisel Gelişim",
    "Bilim & Teknoloji",
    "Genel Kitaplar"
  ];

  return (
    <div className="flex-1 flex flex-col pt-4 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full gap-8">
      {/* Navbar Section */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Library className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kitap Rafım</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Kitap veya yazar ara..." 
              className="pl-9 w-64 rounded-full border-border/50 bg-secondary/50 focus-visible:ring-primary/30"
            />
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Categories / Shelves */}
      {allBooks.length > 0 ? (
        <div className="flex flex-col gap-12 mt-6">
          
          {shelfOrder.map(shelfName => {
            const shelfBooks = categorizedBooks[shelfName];
            if (!shelfBooks || shelfBooks.length === 0) return null;
            
            return (
              <section key={shelfName}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">{shelfName} <span className="text-sm font-normal text-muted-foreground ml-2">({shelfBooks.length})</span></h2>
                  <Button variant="link" className="text-muted-foreground hover:text-foreground">
                    Tümünü Gör
                  </Button>
                </div>
                
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex w-max gap-6">
                    {shelfBooks.map((book) => {
                      // Intelligent cover URL: prefer cover_url, fallback to Google Drive thumbnail
                      const coverSrc = (book.cover_url && !book.cover_url.includes('photo-1542871793'))
                        ? book.cover_url
                        : (book.drive_file_id ? `https://drive.google.com/thumbnail?id=${book.drive_file_id}&sz=w400` : null);
                      
                      return (
                      <Link href={`/book/${book.id}`} key={book.id + shelfName}>
                        <div className="group flex flex-col w-36 sm:w-44 shrink-0 cursor-pointer">
                          <div className="overflow-hidden rounded-md shadow-sm ring-1 ring-border/50 transition-all group-hover:shadow-md group-hover:ring-primary/50 relative aspect-[2/3] bg-muted mb-3">
                            {coverSrc ? (
                              <img
                                src={coverSrc}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 p-4 text-center">
                                <BookOpen className="w-8 h-8 text-muted-foreground opacity-50 mb-2" />
                                <span className="text-xs font-medium text-muted-foreground truncate w-full">{book.title}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                              <Button size="sm" variant="secondary" className="rounded-full font-semibold px-6 shadow-xl w-3/4 pointer-events-none">Aç</Button>
                            </div>
                          </div>
                          <h4 className="font-medium text-sm leading-tight truncate text-foreground">{book.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{book.author || ""}</p>
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" className="hidden sm:flex" />
                </ScrollArea>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border/50">
            <Library className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Henüz kitap eklenmemiş</h2>
          <p className="text-muted-foreground max-w-md">Supabase veritabanındaki "books" tablosuna veriler girdiğinde, kitaplar burada Netflix stili raflarda sergilenecek.</p>
        </div>
      )}
    </div>
  );
}
