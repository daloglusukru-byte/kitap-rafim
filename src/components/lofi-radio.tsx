"use client";

import { useState } from "react";
import ReactPlayer from "react-player/youtube";
import { Volume2, VolumeX, Radio, Play, Pause, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STATIONS = [
  { id: "lofigirl", name: "Lofi Girl (Beats to Relax)", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
  { id: "chillhop", name: "Chillhop Radio", url: "https://www.youtube.com/watch?v=5yx6BWlEVcY" },
  { id: "jazz", name: "Coffee Shop Jazz", url: "https://www.youtube.com/watch?v=cG8JSzpbG_U" },
];

export function LofiRadio() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2); // Default 20% volume
  const [muted, setMuted] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => setPlaying(!playing);
  const toggleMute = () => {
    if (volume === 0) setVolume(0.2);
    setMuted(!muted);
  };
  
  const nextStation = () => {
    setHasError(false);
    setCurrentStation((prev) => (prev + 1) % STATIONS.length);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end transition-all duration-300`}>
      {/* Hidden React Player */}
      <div className="hidden">
        <ReactPlayer
          url={STATIONS[currentStation].url}
          playing={playing}
          volume={muted ? 0 : volume}
          width="0"
          height="0"
          onReady={() => setHasError(false)}
          onError={() => setHasError(true)}
        />
      </div>

      {/* Expanded Controls Panel */}
      {expanded && (
        <div className="mb-2 w-64 rounded-xl border border-border/50 bg-background/80 p-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${playing ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold tracking-tight">Vibe Radio</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground line-clamp-1">
              {hasError ? "Bağlantı Hatası..." : STATIONS[currentStation].name}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full" onClick={togglePlay}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-8 flex-1" onClick={nextStation}>
                Kanal Değiştir
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Button size="icon" variant="ghost" className="w-6 h-6" onClick={toggleMute}>
                {(muted || volume === 0) ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </Button>
              <Slider 
                value={[muted ? 0 : volume * 100]} 
                max={100} 
                step={1} 
                className="flex-1"
                onValueChange={(vals) => {
                  setMuted(false);
                  setVolume(vals[0] / 100);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setExpanded(!expanded)}
              size="icon"
              className={`rounded-full shadow-md w-12 h-12 transition-all duration-500 ${playing && !expanded ? "animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : ""}`}
            >
               {expanded ? <ChevronDown className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Lofi Radio</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

    </div>
  );
}
