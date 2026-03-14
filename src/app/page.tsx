import { ThemeSwitcher } from "@/components/theme-switcher";
import { BookOpen, Search, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

// Geçici Mock Data - İleride Supabase'den gelecek
const mockCategories = [
  {
    id: "felsefe",
    title: "Felsefe & Düşünce",
    books: [
      { id: 1, title: "Ahlakın Soy Kütüğü", author: "F. Nietzsche", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400" },
      { id: 2, title: "Devlet", author: "Platon", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" },
      { id: 3, title: "Batı Felsefesi", author: "B. Russell", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400" },
    ]
  },
  {
    id: "tarih",
    title: "Tarih Klasikleri",
    books: [
      { id: 4, title: "Türklerin Tarihi", author: "İlber Ortaylı", cover: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400" },
      { id: 5, title: "Akdeniz", author: "F. Braudel", cover: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=400" },
    ]
  }
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col pt-4 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full gap-8">
      {/* Navbar Section */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Library className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Architect Library</h1>
            <p className="text-xs text-muted-foreground font-medium">30TB Cloud Engine</p>
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

      {/* Hero / Continue Reading Section */}
      <section className="mt-4">
        <h2 className="text-2xl font-semibold tracking-tight mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Okumaya Devam Et
        </h2>
        
        <Card className="border-border/50 bg-secondary/30 backdrop-blur-sm overflow-hidden border-0 ring-1 ring-border/50 shadow-md">
          <CardContent className="p-0 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-48 h-64 bg-muted relative shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" 
                alt="Devlet"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                <div className="h-full bg-primary w-[45%]" />
              </div>
            </div>
            
            <div className="flex-1 py-6 px-6 md:px-0 flex flex-col justify-center gap-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Kaldığın Yer: Sayfa 142</span>
                <h3 className="text-2xl font-bold mt-1">Devlet - Platon</h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-lg line-clamp-3">
                  "Sokrates: Peki ama adalet nedir? Borçlu olduğun şeyi geri vermek midir adaletin tanımı? Yoksa güçlü olanın işine gelen midir?"
                </p>
              </div>
              
              <div className="flex gap-3 mt-2">
                <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                  Okumaya Dön
                </Button>
                <Button variant="outline" className="rounded-full">
                  Notları Görüntüle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Categories / Shelves */}
      <div className="flex flex-col gap-10 mt-6">
        {mockCategories.map((category) => (
          <section key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">{category.title}</h2>
              <Button variant="link" className="text-muted-foreground hover:text-foreground">
                Tümünü Gör
              </Button>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max gap-6">
                {category.books.map((book) => (
                  <div key={book.id} className="group flex flex-col w-36 sm:w-44 shrink-0 cursor-pointer">
                    <div className="overflow-hidden rounded-md shadow-sm ring-1 ring-border/50 transition-all group-hover:shadow-md group-hover:ring-primary/50 relative aspect-[2/3] bg-muted mb-3">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="secondary" className="rounded-full font-semibold px-6 shadow-xl">Aç</Button>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm leading-tight truncate">{book.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{book.author}</p>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden sm:flex" />
            </ScrollArea>
          </section>
        ))}
      </div>
    </div>
  );
}
