import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LofiRadio } from "@/components/lofi-radio";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Architect Library | Streaming Reader",
  description: "Advanced PDF Reader with Global Lofi Radio",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          themes={['light', 'dark', 'sepia', 'dracula']}
        >
          <TooltipProvider>
            {/* Main Application Area */}
            <main className="flex flex-col min-h-screen">
              {children}
            </main>

            {/* Global Music Player Container */}
            <LofiRadio />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
