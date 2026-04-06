import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Pause,
  Play,
  Radio,
} from "lucide-react";
import { motion } from "motion/react";
import { usePlayer } from "../context/PlayerContext";
import {
  formatChapterTime,
  formatDuration,
  useRssFeed,
} from "../hooks/useRssFeed";
import type { RssChapter } from "../hooks/useRssFeed";

interface RssEpisodeDetailPageProps {
  guid: string;
}

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

/** Strip HTML tags to plain text for safe display */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Sanitize HTML from the RSS feed for safe rendering.
 * Allows common formatting tags; strips scripts and event handlers.
 */
function sanitizeHtml(html: string): string {
  return (
    html
      // Remove script and style blocks entirely
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // Strip event handler attributes (onclick, onload, etc.)
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
      // Strip javascript: hrefs
      .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
      .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")
      // Open external links in new tab safely
      .replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
  );
}

function ChapterList({
  chapters,
  onSeek,
}: {
  chapters: RssChapter[];
  onSeek?: (seconds: number) => void;
}) {
  return (
    <section
      className="rounded-2xl border border-wave-border p-6"
      style={{ background: "#1A1C24" }}
    >
      <h2 className="font-display font-bold text-white text-xl mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-wave-blue" />
        Chapters
      </h2>
      <ol className="space-y-1">
        {chapters.map((chapter, i) => (
          <li key={`${chapter.startTime}-${i}`}>
            <button
              type="button"
              onClick={() => onSeek?.(chapter.startTime)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-wave-border/50 transition-colors text-left group"
            >
              {/* Timestamp badge */}
              <span
                className="flex-shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(71,188,150,0.12)",
                  color: "#47bc96",
                  minWidth: "3.5rem",
                  textAlign: "center",
                }}
              >
                {formatChapterTime(chapter.startTime)}
              </span>

              {/* Chapter artwork (if any) */}
              {chapter.imageUrl && (
                <img
                  src={chapter.imageUrl}
                  alt=""
                  className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                />
              )}

              {/* Title */}
              <span className="flex-1 text-sm text-wave-gray group-hover:text-white transition-colors leading-tight">
                {chapter.title || `Chapter ${i + 1}`}
              </span>

              {/* External link */}
              {chapter.url && (
                <a
                  href={chapter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 text-wave-gray/40 hover:text-wave-blue transition-colors"
                  aria-label="Open chapter link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function RssEpisodeDetailPage({
  guid,
}: RssEpisodeDetailPageProps) {
  const { episodes, isLoading } = useRssFeed();
  const { playEpisode, pauseEpisode, seekTo, currentEpisode, isPlaying } =
    usePlayer();

  const decodedGuid = decodeURIComponent(guid);
  const episodeIndex = episodes.findIndex((e) => e.guid === decodedGuid);
  const episode = episodes[episodeIndex] ?? null;

  const prevEpisode = episodeIndex > 0 ? episodes[episodeIndex - 1] : null;
  const nextEpisode =
    episodeIndex < episodes.length - 1 ? episodes[episodeIndex + 1] : null;

  const isCurrentEpisode = currentEpisode?.guid === episode?.guid;
  const isCurrentlyPlaying = isCurrentEpisode && isPlaying;

  const handlePlay = () => {
    if (!episode) return;
    if (isCurrentlyPlaying) {
      pauseEpisode();
    } else {
      playEpisode(episode);
    }
  };

  const handleChapterSeek = (seconds: number) => {
    if (!episode) return;
    if (!isCurrentEpisode) {
      playEpisode(episode);
      // Small delay to let the player mount before seeking
      setTimeout(() => seekTo?.(seconds), 600);
    } else {
      seekTo?.(seconds);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="aspect-square rounded-2xl" />
          </div>
          <div className="md:col-span-3 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Radio className="w-12 h-12 text-wave-gray/30 mx-auto mb-4" />
        <p className="text-wave-gray text-lg font-semibold">
          Episode not found.
        </p>
        <Link
          to="/episodes"
          className="mt-4 inline-block text-wave-blue hover:text-white transition-colors text-sm"
        >
          ← Back to episodes
        </Link>
      </div>
    );
  }

  const hasChapters = episode.chapters.length > 0;
  const formattedDuration = formatDuration(episode.duration);

  // Prefer rich HTML show notes; fall back to plain description
  const showNotesHtml = episode.showNotes
    ? sanitizeHtml(episode.showNotes)
    : episode.description
      ? sanitizeHtml(episode.description)
      : null;

  // Plain text description for the short blurb in the header
  const shortDescription = episode.description
    ? stripHtml(episode.description)
    : "";

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/episodes"
            className="inline-flex items-center gap-2 text-wave-gray hover:text-white transition-colors mb-8 group"
            data-ocid="rss_episode.back.link"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-wide">
              All Episodes
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Episode header */}
          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* Artwork */}
            <div className="md:col-span-2">
              <div className="rounded-2xl overflow-hidden aspect-square shadow-glow">
                {episode.artworkUrl ? (
                  <img
                    src={episode.artworkUrl}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "#1A1C24" }}
                  >
                    <Radio className="w-16 h-16 text-wave-gray/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="md:col-span-3 space-y-5">
              <div>
                <p className="text-xs font-semibold tracking-widest text-wave-blue uppercase mb-2">
                  Episode
                </p>
                <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-tight">
                  {episode.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4">
                {episode.pubDate && (
                  <span className="flex items-center gap-1.5 text-sm text-wave-gray">
                    <Calendar className="w-4 h-4" />
                    {formatPubDate(episode.pubDate)}
                  </span>
                )}
                {formattedDuration && (
                  <span className="flex items-center gap-1.5 text-sm text-wave-gray">
                    <Clock className="w-4 h-4" />
                    {formattedDuration}
                  </span>
                )}
              </div>

              {shortDescription && (
                <p className="text-wave-gray leading-relaxed">
                  {shortDescription}
                </p>
              )}

              {/* Play button */}
              <button
                type="button"
                onClick={handlePlay}
                className="flex items-center gap-3 gradient-btn font-bold px-6 py-3.5 rounded-full text-sm tracking-wider uppercase shadow-glow hover:opacity-90 transition-opacity"
                data-ocid="rss_episode.play.button"
              >
                {isCurrentlyPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    Pause Episode
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    {isCurrentEpisode ? "Resume Episode" : "Play Episode"}
                  </>
                )}
              </button>

              {isCurrentlyPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex gap-0.5 items-end h-4">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className="w-1 rounded-t-sm animate-pulse"
                        style={{
                          background: "#47bc96",
                          height: `${bar * 25}%`,
                          animationDelay: `${bar * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-wave-blue uppercase tracking-widest">
                    Now Playing
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Chapters */}
          {hasChapters && (
            <ChapterList
              chapters={episode.chapters}
              onSeek={handleChapterSeek}
            />
          )}

          {/* Show notes / About */}
          {showNotesHtml && (
            <section
              className="rounded-2xl border border-wave-border p-6"
              style={{ background: "#1A1C24" }}
            >
              <h2 className="font-display font-bold text-white text-xl mb-4">
                About This Episode
              </h2>
              {/* Render HTML from RSS feed, preserving paragraphs and formatting */}
              <div
                className="text-wave-gray leading-relaxed prose-rss"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: RSS feed show notes are sanitized before rendering
                dangerouslySetInnerHTML={{ __html: showNotesHtml }}
              />
            </section>
          )}

          {/* Prev / Next navigation */}
          <div className="grid grid-cols-2 gap-4">
            {prevEpisode ? (
              <Link
                to="/episodes/$guid"
                params={{ guid: encodeURIComponent(prevEpisode.guid) }}
                className="flex items-center gap-3 p-4 rounded-2xl border border-wave-border hover:border-wave-blue transition-colors group"
                style={{ background: "#1A1C24" }}
                data-ocid="rss_episode.prev.link"
              >
                <ChevronLeft className="w-5 h-5 text-wave-gray group-hover:text-wave-blue flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs text-wave-gray/60 uppercase tracking-widest">
                    Previous
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {prevEpisode.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextEpisode ? (
              <Link
                to="/episodes/$guid"
                params={{ guid: encodeURIComponent(nextEpisode.guid) }}
                className="flex items-center justify-end gap-3 p-4 rounded-2xl border border-wave-border hover:border-wave-blue transition-colors text-right group"
                style={{ background: "#1A1C24" }}
                data-ocid="rss_episode.next.link"
              >
                <div className="overflow-hidden">
                  <p className="text-xs text-wave-gray/60 uppercase tracking-widest">
                    Next
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {nextEpisode.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-wave-gray group-hover:text-wave-blue flex-shrink-0" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
