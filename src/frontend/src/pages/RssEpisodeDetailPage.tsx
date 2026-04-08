import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Pause,
  Play,
  Radio,
  Share2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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

function ShareModal({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${title} — Indie City Radio`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: "#000000",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-current"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${encodedTitle}+${encodedUrl}`,
      bg: "#0085FF",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-current"
          aria-hidden="true"
        >
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: "#1877F2",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-current"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="share-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="share-modal"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.25, type: "spring", bounce: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-wave-border p-6 space-y-5 shadow-glow"
          style={{ background: "#1A1C24" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-wave-blue" />
              Share Episode
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close share dialog"
              className="text-wave-gray hover:text-white transition-colors p-1 rounded-lg hover:bg-wave-border/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Episode title */}
          <p className="text-sm text-wave-gray leading-snug line-clamp-2">
            {title}
          </p>

          {/* Copy link */}
          <div
            className="flex items-center gap-2 p-3 rounded-xl border border-wave-border"
            style={{ background: "#12131A" }}
          >
            <span className="flex-1 text-xs text-wave-gray truncate font-mono">
              {url}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              data-ocid="share.copy_link.button"
              className="flex items-center gap-1.5 text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
              style={{
                background: copied
                  ? "rgba(71,188,150,0.2)"
                  : "rgba(71,188,150,0.15)",
                color: "#47bc96",
                border: "1px solid rgba(71,188,150,0.3)",
              }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Share buttons */}
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-wave-gray/60 uppercase">
              Share to
            </p>
            <div className="flex gap-3">
              {shareLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`share.${link.label.toLowerCase().replace(/[^a-z]/g, "_")}.link`}
                  className="flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-wave-border hover:border-transparent transition-all duration-200 group text-white"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = link.bg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.04)";
                  }}
                  aria-label={`Share on ${link.label}`}
                >
                  {link.icon}
                  <span className="text-xs font-semibold text-wave-gray group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  const [shareOpen, setShareOpen] = useState(false);

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
      {shareOpen && (
        <ShareModal title={episode.title} onClose={() => setShareOpen(false)} />
      )}
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

              {/* Play + Share buttons */}
              <div className="flex items-center gap-3 flex-wrap">
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

                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase transition-colors duration-200 border border-wave-border hover:border-wave-blue text-wave-gray hover:text-white"
                  data-ocid="rss_episode.share.button"
                  aria-label="Share episode"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

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
