import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { Play, Radio } from "lucide-react";
import { motion } from "motion/react";
import { usePlayer } from "../context/PlayerContext";
import { useRssFeed } from "../hooks/useRssFeed";
import type { RssEpisode } from "../hooks/useRssFeed";

function formatPubDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function EpisodeRow({
  episode,
  index,
}: {
  episode: RssEpisode;
  index: number;
}) {
  const navigate = useNavigate();
  const { playEpisode, currentEpisode, isPlaying } = usePlayer();
  const isCurrentlyPlaying = currentEpisode?.guid === episode.guid && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    playEpisode(episode);
  };

  const handleRowClick = () => {
    navigate({
      to: "/episodes/$guid",
      params: { guid: encodeURIComponent(episode.guid) },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      data-ocid={`episodes.item.${index + 1}`}
    >
      <button
        type="button"
        onClick={handleRowClick}
        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-wave-border hover:border-wave-blue/50 transition-all duration-200 text-left group"
        style={{ background: "#1A1C24" }}
      >
        {/* Artwork */}
        <div className="relative flex-shrink-0">
          {episode.artworkUrl ? (
            <img
              src={episode.artworkUrl}
              alt={episode.title}
              className="w-20 h-20 rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center"
              style={{ background: "#12131A" }}
            >
              <Radio className="w-6 h-6 text-wave-gray/40" />
            </div>
          )}
          {isCurrentlyPlaying && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/40">
              <div className="flex gap-0.5 items-end h-4">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className="w-1 rounded-t-sm animate-pulse"
                    style={{
                      background: "#47bc96",
                      height: `${bar * 33}%`,
                      animationDelay: `${bar * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Episode info */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-wave-blue transition-colors">
                {episode.title}
              </h3>
              <p className="text-xs text-wave-gray/70 mt-1">
                {formatPubDate(episode.pubDate)}
                {episode.duration && (
                  <span className="ml-3 text-wave-gray/50">
                    {episode.duration}
                  </span>
                )}
              </p>
              <p className="text-sm text-wave-gray/80 mt-2 line-clamp-2 leading-relaxed">
                {episode.description.replace(/<[^>]*>/g, "").slice(0, 150)}
                {episode.description.replace(/<[^>]*>/g, "").length > 150 &&
                  "..."}
              </p>
            </div>

            {/* Play button */}
            <button
              type="button"
              onClick={handlePlay}
              className="flex-shrink-0 w-10 h-10 rounded-full gradient-btn flex items-center justify-center shadow-glow hover:opacity-90 transition-opacity"
              aria-label={`Play ${episode.title}`}
              data-ocid={`episodes.play.button.${index + 1}`}
            >
              <Play className="w-4 h-4 text-[#0B0D12] fill-[#0B0D12] ml-0.5" />
            </button>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

function EpisodeRowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl border border-wave-border"
      style={{ background: "#1A1C24" }}
    >
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    </div>
  );
}

export default function EpisodesPage() {
  const { episodes, isLoading, error } = useRssFeed();

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold tracking-[0.4em] text-wave-blue uppercase mb-3">
            <Radio className="inline w-3 h-3 mr-2" />
            Indie City Radio
          </p>
          <div className="flex items-end justify-between">
            <h1 className="font-display font-black text-4xl md:text-5xl text-white leading-none">
              Latest Podcast
              <br />
              <span className="gradient-text">Episodes</span>
            </h1>
            {!isLoading && episodes.length > 0 && (
              <span className="text-sm text-wave-gray">
                {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </motion.div>

        {/* States */}
        {isLoading ? (
          <div className="space-y-3" data-ocid="episodes.loading_state">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <EpisodeRowSkeleton key={n} />
            ))}
          </div>
        ) : error ? (
          <div
            className="text-center py-20 rounded-2xl border border-wave-border"
            style={{ background: "#1A1C24" }}
            data-ocid="episodes.error_state"
          >
            <Radio className="w-12 h-12 text-wave-red/50 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Feed unavailable</p>
            <p className="text-wave-gray/70 text-sm mt-2 max-w-sm mx-auto">
              Couldn&apos;t load the podcast feed right now. Please try again
              shortly.
            </p>
          </div>
        ) : episodes.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border border-wave-border"
            style={{ background: "#1A1C24" }}
            data-ocid="episodes.empty_state"
          >
            <Radio className="w-12 h-12 text-wave-gray/30 mx-auto mb-4" />
            <p className="text-wave-gray font-semibold text-lg">
              No episodes yet
            </p>
            <p className="text-wave-gray/60 text-sm mt-2">
              Check back soon — something is being recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map((episode, index) => (
              <EpisodeRow key={episode.guid} episode={episode} index={index} />
            ))}
          </div>
        )}

        {/* Subscribe links */}
        {!isLoading && !error && episodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-12 pt-8 border-t border-wave-border text-center"
          >
            <p className="text-sm text-wave-gray/60">
              Subscribe on your favourite platform
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Link
                to="/rss"
                className="text-sm text-wave-gray hover:text-wave-blue transition-colors"
                data-ocid="episodes.rss_feed.link"
              >
                RSS Feed
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
