import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params } // Next.js 15+ async params
) {
  try {
    const { id } = await params;
    const fileId = id;
    
    // Google Drive direct download endpoint pattern for large files
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    console.log(`[Drive Proxy] Requesting file ${fileId}`);
    
    let response;
    try {
      // Native fetch is streaming by default if we just pass the .body to NextResponse
      response = await fetch(driveUrl, {
        method: "GET",
        // Follow redirects to handle the virus scan bypass logic implicitly
        redirect: 'follow',
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
    } catch(fetchError: any) {
        console.error(`[Drive Proxy] Network fetch failed outright:`, fetchError);
        return new NextResponse(`Drive API Fetch Error: ${fetchError.message}`, { status: 502 });
    }

    if (!response.ok) {
      console.error(`[Drive Proxy] HTTP Error Response: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`[Drive Proxy] Error Body:`, text.substring(0, 200));
      return new NextResponse(`Drive API Error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`[Drive Proxy] Google Drive returned an HTML page instead of PDF. This usually means the file is NOT PUBLIC or requires login.`);
      return new NextResponse(`Dosya okuma izni yok. Google Drive'da dosyanın 'Bağlantıyı bilen herkes' olarak paylaşıldığından emin olun.`, { status: 403 });
    }

    // Capture binary data fully to satisfy react-pdf worker requirements
    console.log(`[Drive Proxy] Reading buffer from Google Drive...`);
    const buffer = await response.arrayBuffer();
    console.log(`[Drive Proxy] Downloaded Buffer Size: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // Gelen buffer çok küçükse ve hala PDF değilse
    if (buffer.byteLength < 100000 && buffer.byteLength > 0) {
        const textDecoder = new TextDecoder('utf-8');
        const textChunk = textDecoder.decode(buffer.slice(0, 500));
        if (textChunk.includes('<html') || textChunk.includes('<!DOCTYPE html>')) {
           return new NextResponse(`Dosya okuma izni yok veya virüs taraması uyarısına takıldı. Google Drive paylaşım ayarlarını kontrol edin.`, { status: 403 });
        }
    }

    // Pass the raw web stream directly to the client
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=86400',
        'Content-Disposition': `inline; filename="book-${fileId}.pdf"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Accept-Ranges': 'bytes'
      },
    });
    
  } catch (error: any) {
    console.error(`[Drive Proxy] Internal Error:`, error);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
