import { Slider } from "@/components/ui/slider";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
  duration?: string;
}

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const WAVE_BARS = [
  { id: "b01", h: 30 },
  { id: "b02", h: 60 },
  { id: "b03", h: 45 },
  { id: "b04", h: 80 },
  { id: "b05", h: 55 },
  { id: "b06", h: 90 },
  { id: "b07", h: 40 },
  { id: "b08", h: 70 },
  { id: "b09", h: 50 },
  { id: "b10", h: 85 },
  { id: "b11", h: 35 },
  { id: "b12", h: 65 },
  { id: "b13", h: 75 },
  { id: "b14", h: 48 },
  { id: "b15", h: 95 },
  { id: "b16", h: 62 },
  { id: "b17", h: 42 },
  { id: "b18", h: 72 },
  { id: "b19", h: 57 },
  { id: "b20", h: 83 },
];

export default function AudioPlayer({
  src,
  title,
  duration,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setTotalDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  }, [isPlaying, src]);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = value[0];
    audio.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const skip = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.max(
        0,
        Math.min(audio.currentTime + seconds, totalDuration),
      );
    },
    [totalDuration],
  );

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className="rounded-2xl p-6 md:p-8 player-gradient"
      data-ocid="player.panel"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="metadata">
        <track kind="captions" />
      </audio>

      {/* Track title */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-1">
          Now Playing
        </p>
        <h3 className="font-display font-bold text-white text-lg md:text-xl uppercase tracking-wide line-clamp-1">
          {title}
        </h3>
        {duration && <p className="text-sm text-white/60 mt-1">{duration}</p>}
      </div>

      {/* Waveform visualization */}
      <div className="flex items-end gap-0.5 h-12 mb-6 opacity-60">
        {WAVE_BARS.map(({ id, h }, i) => {
          const barProgress = (i / WAVE_BARS.length) * 100;
          const isActive = barProgress <= progress;
          return (
            <div
              key={id}
              className="flex-1 rounded-t-sm transition-all duration-100"
              style={{
                height: `${h}%`,
                background: isActive
                  ? "linear-gradient(to top, #2D9CFF, #FF3B5C)"
                  : "rgba(255,255,255,0.2)",
              }}
            />
          );
        })}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <Slider
          value={[currentTime]}
          min={0}
          max={totalDuration || 100}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
          data-ocid="player.progress.input"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/60 font-mono">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-white/60 font-mono">
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-white/60 hover:text-white transition-colors"
            data-ocid="player.mute.toggle"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              data-ocid="player.volume.input"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => skip(-15)}
            className="text-white/60 hover:text-white transition-colors"
            data-ocid="player.skip_back.button"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!src || isLoading}
            className="w-14 h-14 rounded-full gradient-btn flex items-center justify-center shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
            data-ocid="player.play.button"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(15)}
            className="text-white/60 hover:text-white transition-colors"
            data-ocid="player.skip_forward.button"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="w-32" />
      </div>
    </div>
  );
}
