"use client";

import dynamic from "next/dynamic";
import { BookOpen, Loader2 } from "lucide-react";

// The dynamic component definition
const PDFViewerInner = dynamic(
  () => import("@/components/pdf-viewer").then((mod) => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center pt-8 overflow-y-auto">
        <div className="max-w-3xl w-full flex flex-col items-center">
          <div className="w-24 h-32 bg-secondary rounded-md shadow flex items-center justify-center mb-6">
             <BookOpen className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Okuyucu Yükleniyor...</h2>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    )
  }
);

interface PDFViewerWrapperProps {
  bookId: string;
  driveFileId: string;
}

// Client wrapper component
export function PDFViewerClientWrapper({ bookId, driveFileId }: PDFViewerWrapperProps) {
  return <PDFViewerInner bookId={bookId} driveFileId={driveFileId} />;
}
