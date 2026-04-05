import { Slider } from "@/components/ui/slider";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds) || seconds < 0)
    return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PersistentPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    pauseEpisode,
    resumeEpisode,
    seekTo,
    skipBy,
    setVolume,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const togglePlay = () => {
    if (isPlaying) {
      pauseEpisode();
    } else {
      resumeEpisode();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume || 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    if (val[0] > 0) setIsMuted(false);
    else setIsMuted(true);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentEpisode && (
        <motion.div
          key="persistent-player"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "#12131A",
            borderTop: "1px solid #2A2D38",
          }}
          data-ocid="persistent_player.panel"
        >
          {/* Progress bar at top */}
          <div className="relative h-1 bg-wave-border">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #47bc96, #ffffff)",
              }}
            />
            {/* Clickable overlay for seeking */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek"
              data-ocid="persistent_player.progress.input"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-4">
            {/* Episode info */}
            <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
              {currentEpisode.artworkUrl ? (
                <img
                  src={currentEpisode.artworkUrl}
                  alt={currentEpisode.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-glow"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ background: "#1A1C24" }}
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {currentEpisode.title}
                </p>
                <p className="text-xs text-wave-gray truncate">
                  {currentEpisode.pubDate
                    ? new Date(currentEpisode.pubDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )
                    : "Indie City Radio"}
                </p>
              </div>
            </div>

            {/* Controls — centered */}
            <div className="flex items-center gap-3 flex-shrink-0 mx-auto">
              <button
                type="button"
                onClick={() => skipBy(-15)}
                className="text-wave-gray hover:text-white transition-colors"
                aria-label="Skip back 15 seconds"
                data-ocid="persistent_player.skip_back.button"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-11 h-11 rounded-full gradient-btn flex items-center justify-center shadow-glow hover:opacity-90 transition-opacity"
                aria-label={isPlaying ? "Pause" : "Play"}
                data-ocid="persistent_player.play.button"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-[#0B0D12] fill-[#0B0D12]" />
                ) : (
                  <Play className="w-5 h-5 text-[#0B0D12] fill-[#0B0D12] ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skipBy(15)}
                className="text-wave-gray hover:text-white transition-colors"
                aria-label="Skip forward 15 seconds"
                data-ocid="persistent_player.skip_forward.button"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Time */}
              <span className="text-xs font-mono text-wave-gray hidden sm:block tabular-nums w-24 text-center">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Volume — right side */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <button
                type="button"
                onClick={toggleMute}
                className="text-wave-gray hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
                data-ocid="persistent_player.mute.toggle"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="w-20 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  aria-label="Volume"
                  data-ocid="persistent_player.volume.input"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
