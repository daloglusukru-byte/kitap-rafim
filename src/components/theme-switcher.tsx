"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, BookOpen, Coffee, ScrollText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "icon", className: "rounded-full shadow-sm" })}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 sepia:rotate-90 sepia:scale-0 dracula:rotate-90 dracula:scale-0 parchment:rotate-90 parchment:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <BookOpen className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all sepia:rotate-0 sepia:scale-100 text-yellow-800" />
        <Coffee className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dracula:rotate-0 dracula:scale-100 text-purple-400" />
        <ScrollText className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all parchment:rotate-0 parchment:scale-100 text-amber-700" />
        <span className="sr-only">Tema değiştir</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
          <Sun className="w-4 h-4" /> Açık Mod
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
          <Moon className="w-4 h-4" /> Karanlık Mod
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sepia")} className="gap-2 cursor-pointer text-yellow-700 dark:text-yellow-600">
          <BookOpen className="w-4 h-4" /> Sepya (Okuma)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("parchment")} className="gap-2 cursor-pointer text-amber-900 dark:text-amber-700">
          <ScrollText className="w-4 h-4" /> Saman Kağıdı
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dracula")} className="gap-2 cursor-pointer text-purple-600 dark:text-purple-400">
          <Coffee className="w-4 h-4" /> Dracula
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
