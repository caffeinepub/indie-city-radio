import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RssEpisode } from "../hooks/useRssFeed";

interface PlayerContextValue {
  currentEpisode: RssEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playEpisode: (episode: RssEpisode) => void;
  pauseEpisode: () => void;
  resumeEpisode: () => void;
  seekTo: (seconds: number) => void;
  skipBy: (seconds: number) => void;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<RssEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playEpisode = useCallback((episode: RssEpisode) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentEpisode((prev) => {
      if (prev?.guid === episode.guid) {
        // Same episode — just resume
        audio.play().catch(console.error);
        return prev;
      }
      // New episode
      audio.pause();
      audio.src = episode.audioUrl;
      audio.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);
      audio.play().catch(console.error);
      return episode;
    });
  }, []);

  const pauseEpisode = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resumeEpisode = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
    setCurrentTime(audio.currentTime);
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.max(
      0,
      Math.min(audio.currentTime + seconds, audio.duration || 0),
    );
    audio.currentTime = next;
    setCurrentTime(next);
  }, []);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(1, v));
    audio.volume = clamped;
    setVolumeState(clamped);
  }, []);

  const value: PlayerContextValue = {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    playEpisode,
    pauseEpisode,
    resumeEpisode,
    seekTo,
    skipBy,
    setVolume,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}
