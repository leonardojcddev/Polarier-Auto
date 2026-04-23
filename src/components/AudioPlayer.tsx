import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  avatarUrl?: string | null;
  initial?: string;
  sender: "user" | "bot";
  botAvatarSrc?: string;
}

const SPEEDS = [1, 1.5, 2];

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const AudioPlayer = ({ src, avatarUrl, initial = "U", sender, botAvatarSrc }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => setDuration(a.duration);
    const onTime = () => setCurrent(a.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
      a.currentTime = 0;
    };
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("durationchange", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("durationchange", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const cycleSpeed = () => {
    const a = audioRef.current;
    if (!a) return;
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    a.playbackRate = next;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const v = parseFloat(e.target.value);
    a.currentTime = (v / 100) * duration;
    setCurrent(a.currentTime);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const display = playing || current > 0 ? current : duration;

  return (
    <div className="flex items-center gap-2.5 min-w-[240px] sm:min-w-[280px] max-w-xs">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold text-secondary-foreground overflow-hidden">
        {sender === "bot" && botAvatarSrc ? (
          <img src={botAvatarSrc} alt="Bot" className="w-6 h-6" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
        aria-label={playing ? "Pausar" : "Reproducir"}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-[1px]" />}
      </button>

      {/* Slider + tiempo */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="relative h-1 w-full">
          <div className="absolute inset-0 bg-foreground/20 rounded-full" />
          <div
            className="absolute inset-y-0 left-0 bg-secondary rounded-full"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Progreso"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-secondary shadow pointer-events-none transition-[left]"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground mt-1 tabular-nums">
          {formatTime(display)}
        </span>
      </div>

      {/* Velocidad */}
      <button
        onClick={cycleSpeed}
        className="text-[11px] font-semibold text-secondary-foreground bg-secondary/80 hover:bg-secondary rounded-full px-2 py-0.5 shrink-0 transition-colors"
        aria-label="Cambiar velocidad"
      >
        {speed}×
      </button>

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default AudioPlayer;
