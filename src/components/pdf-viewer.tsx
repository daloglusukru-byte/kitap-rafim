"use client";

import { useState, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker configuration for react-pdf (local copy from public folder)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  bookId: string;
  driveFileId: string;
  initialPage?: number;
}

export function PDFViewer({ bookId, driveFileId, initialPage = 1 }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState(true);

  // Memoize options to prevent unnecessary re-renders (react-pdf warning fix)
  const pdfOptions = useMemo(() => ({
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/standard_fonts/",
    wasmUrl: "/",
    useWasm: true,
  }), []);

  // PDF Fetch proxy URL
  const pdfUrl = `/api/pdf/${driveFileId}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages || 1);
    });
  }

  function changeScale(amount: number) {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + amount), 3.0));
  }

  function takeScreenshot() {
    const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `kitap-sayfa-${pageNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("PDF sayfası tam yüklenmediği için ekran görüntüsü alınamıyor.");
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-100/10 dark:bg-zinc-950">
      {/* Viewer Toolbar */}
      <div className="h-12 border-b border-border/50 bg-secondary/50 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 rounded-full"
            onClick={() => changeScale(-0.2)}
            disabled={scale <= 0.6}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 rounded-full"
            onClick={() => changeScale(0.2)}
            disabled={scale >= 2.8}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-8 h-8 rounded-full mr-2"
            disabled={loading}
            onClick={takeScreenshot}
            title="Ekran Görüntüsü Al (Sayfa Fotoğrafı)"
          >
            <Camera className="w-4 h-4" />
          </Button>

          <Button 
            variant="secondary" 
            size="icon" 
            className="w-8 h-8 rounded-full"
            disabled={pageNumber <= 1 || loading}
            onClick={() => changePage(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-sm font-medium w-24 text-center">
            {pageNumber} / {numPages || "..."}
          </div>

          <Button 
            variant="secondary" 
            size="icon" 
            className="w-8 h-8 rounded-full"
            disabled={pageNumber >= (numPages || 1) || loading}
            onClick={() => changePage(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas Region */}
      <div className="flex-1 overflow-auto flex justify-center pb-24 relative p-4 custom-scrollbar bg-zinc-900/50">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              PDF Belgesi Yükleniyor...
            </p>
          </div>
        )}
        
        <div className="shadow-2xl ring-1 ring-black/5 dark:ring-white/10 mx-auto transition-transform">
          <Document 
            file={pdfUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            loading={null}
            className="flex flex-col items-center"
            options={pdfOptions}
            error={
              <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
                PDF yüklenirken bir sorun oluştu. Google Drive linki geçersiz veya paylaşım izinleri kapalı olabilir.
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true} 
              renderAnnotationLayer={true}
              className="shadow-lg bg-white"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
