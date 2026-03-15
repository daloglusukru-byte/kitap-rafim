"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Radio, Play, Pause, ChevronUp, ChevronDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STATIONS = [
  { id: "lofigirl", name: "Lofi Girl (Beats to Relax)", videoId: "jfKfPfyJRdk" },
  { id: "classical", name: "Classical Music & Mozart", videoId: "mIYzp5rcTvU" },
];

export function LofiRadio() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2); // Default 20% volume
  const [muted, setMuted] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ses miktarını 0.0 - 1.0 aralığı yerine 0-100 aralığında alıp Youtube API'sine göndermek için helper
  const safeVolume = typeof volume === 'number' && !isNaN(volume) ? volume : 0.5;

  const togglePlay = () => {
    if (!iframeRef.current?.contentWindow) return;
    
    // Modern browser autoplay policies often require an initial unmute
    iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), 'https://www.youtube.com');

    if (playing) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), 'https://www.youtube.com');
      setPlaying(false);
    } else {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), 'https://www.youtube.com');
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!iframeRef.current?.contentWindow) return;
    
    if (muted || volume === 0) {
      setMuted(false);
      if (volume === 0) setVolume(0.2);
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), 'https://www.youtube.com');
    } else {
      setMuted(true);
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), 'https://www.youtube.com');
    }
  };
  
  const handleVolumeChange = (value: number | readonly number[]) => {
    const vals = Array.isArray(value) || (value as any)?.length !== undefined ? (value as number[]) : [value as number];
    setMuted(false);
    const newVol = vals[0] / 100;
    setVolume(newVol);
    
    if (!iframeRef.current?.contentWindow) return;
    
    // Yüzdelik ses değerini Youtube'un anlayacağı tam sayı 0-100'e yuvarla
    const ytVolume = Math.round(newVol * 100);

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "unMute", args: [] }), "https://www.youtube.com"
    );
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "setVolume", args: [ytVolume] }), "https://www.youtube.com"
    );
  };

  const nextStation = () => {
    setHasError(false);
    setPlaying(false); // iFrame URL'si değiştiğinde baştan play bekleyeceğiz (autoplay riskine girmemek için)
    setCurrentStation((prev) => (prev + 1) % STATIONS.length);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end transition-all duration-300`}>
      {/* Hidden Native YouTube iFrame */}
      <div className="absolute bottom-0 right-0 w-[10px] h-[10px] opacity-0 pointer-events-none z-[-1] overflow-hidden">
        <iframe
          ref={iframeRef}
          width="100"
          height="100"
          src={`https://www.youtube.com/embed/${STATIONS[currentStation].videoId}?enablejsapi=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0`}
          title="Lofi Radio Stream"
          allow="autoplay; encrypted-media"
          className="border-0"
        />
      </div>

      {/* Expanded Controls Panel - Saman Kağıdı Modeli (Warm/Amber UI) */}
      {expanded && (
        <div className="mb-2 w-72 rounded-xl border border-[#d2b48c] bg-[#fbf5e6]/95 dark:border-[#8b7355] dark:bg-[#2c241b]/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8dcb8] dark:border-[#4a3e2f]">
            <div className="flex items-center gap-2">
              <Radio className={`w-5 h-5 ${playing ? "text-amber-600 animate-pulse" : "text-amber-800/60 dark:text-amber-200/50"}`} />
              <span className="text-sm font-serif font-bold tracking-widest uppercase text-amber-900 dark:text-amber-100">Kütüphane FM</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-xs font-semibold text-amber-800/80 dark:text-amber-300/80 line-clamp-1 italic text-center">
              {hasError ? "Bağlantı Hatası..." : STATIONS[currentStation].name}
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <Button size="icon" variant="outline" className="w-10 h-10 rounded-full border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 dark:border-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-800 dark:text-amber-100" onClick={togglePlay}>
                {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-9 px-4 border-amber-300 bg-transparent hover:bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:hover:bg-amber-900/30 dark:text-amber-200" onClick={nextStation}>
                Frekans Değiş
              </Button>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button size="icon" variant="ghost" className="w-8 h-8 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:text-amber-100" onClick={toggleMute}>
                {(muted || volume === 0) ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider 
                value={[muted ? 0 : safeVolume * 100]} 
                max={100} 
                step={1} 
                className="flex-1 cursor-pointer"
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger 
            onClick={() => setExpanded(!expanded)}
            className={buttonVariants({ size: "icon", className: `rounded-full shadow-lg border-2 border-amber-200 w-14 h-14 transition-all duration-300 bg-[#f4e8c1] hover:bg-[#ebd8a2] text-amber-900 dark:bg-[#3d3124] dark:border-[#5c4a3d] dark:text-amber-100 dark:hover:bg-[#4d3e2e] ${playing && !expanded ? "animate-pulse ring-4 ring-amber-500/30 ring-offset-2 ring-offset-[#fbf5e6] dark:ring-offset-[#1c1917]" : ""}` })}
          >
             {expanded ? <ChevronDown className="w-6 h-6" /> : <Radio className="w-6 h-6" />}
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#fbf5e6] text-amber-900 border-[#d2b48c] dark:bg-[#2c241b] dark:text-amber-100 dark:border-[#5c4a3d]">
            <p className="font-serif italic font-medium">Odak Radyosu</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

    </div>
  );
}
