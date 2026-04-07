import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Rss,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import AudioPlayer from "../components/AudioPlayer";
import type { Episode } from "../hooks/useQueries";
import { useEpisode, usePublishedEpisodes } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

interface EpisodePageProps {
  id: string;
}

export default function EpisodePage({ id }: EpisodePageProps) {
  const navigate = useNavigate();
  const episodeId = BigInt(id);
  const { data: episodeData, isLoading } = useEpisode(episodeId);
  const episode = episodeData as Episode | null | undefined;
  const { data: allEpisodes } = usePublishedEpisodes();
  const { getFileUrl } = useStorageClient();

  const artworkUrl = episode?.artworkFileId
    ? getFileUrl(episode.artworkFileId)
    : "";
  const audioUrl = episode?.audioFileId ? getFileUrl(episode.audioFileId) : "";

  const sortedEpisodes: Episode[] = (allEpisodes ?? [])
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id));

  const currentIndex = sortedEpisodes.findIndex((e) => e.id.toString() === id);
  const prevEpisode =
    currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < sortedEpisodes.length - 1
      ? sortedEpisodes[currentIndex + 1]
      : null;

  const copyRssLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/rss`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("RSS feed link copied!");
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-wave-gray text-lg">Episode not found.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-wave-blue hover:text-white transition-colors"
        >
          ← Back to episodes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-wave-gray hover:text-white transition-colors mb-8 group"
            data-ocid="episode.back.button"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-wide">
              All Episodes
            </span>
          </button>
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
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/assets/generated/wave-placeholder-artwork.dim_400x400.jpg"
                    alt="Episode artwork"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="md:col-span-3 space-y-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-wave-blue uppercase mb-2">
                  Episode
                </p>
                <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-tight">
                  {episode.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4">
                <span className="flex items-center gap-1.5 text-sm text-wave-gray">
                  <Calendar className="w-4 h-4" />
                  {episode.publishedDate}
                </span>
                {episode.duration && (
                  <span className="flex items-center gap-1.5 text-sm text-wave-gray">
                    <Clock className="w-4 h-4" />
                    {episode.duration}
                  </span>
                )}
              </div>

              <p className="text-wave-gray leading-relaxed">
                {episode.description}
              </p>

              <button
                type="button"
                onClick={copyRssLink}
                className="flex items-center gap-2 text-sm text-wave-gray hover:text-wave-blue transition-colors border border-wave-border hover:border-wave-blue px-4 py-2 rounded-full"
                data-ocid="episode.copy_rss.button"
              >
                <Rss className="w-4 h-4" />
                Copy RSS Feed Link
              </button>
            </div>
          </div>

          {/* Audio player */}
          <AudioPlayer
            src={audioUrl}
            title={episode.title}
            duration={episode.duration}
          />

          {/* Show notes */}
          {episode.showNotes && (
            <section
              className="rounded-2xl border border-wave-border p-6"
              style={{ background: "#1A1C24" }}
            >
              <h2 className="font-display font-bold text-white text-xl mb-4">
                Show Notes
              </h2>
              <div className="text-wave-gray leading-relaxed whitespace-pre-wrap">
                {episode.showNotes}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-4">
            {prevEpisode ? (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/episode/$id",
                    params: { id: prevEpisode.id.toString() },
                  })
                }
                className="flex items-center gap-3 p-4 rounded-2xl border border-wave-border hover:border-wave-blue transition-colors text-left group"
                style={{ background: "#1A1C24" }}
                data-ocid="episode.prev.button"
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
              </button>
            ) : (
              <div />
            )}
            {nextEpisode ? (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/episode/$id",
                    params: { id: nextEpisode.id.toString() },
                  })
                }
                className="flex items-center justify-end gap-3 p-4 rounded-2xl border border-wave-border hover:border-wave-blue transition-colors text-right group"
                style={{ background: "#1A1C24" }}
                data-ocid="episode.next.button"
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
              </button>
            ) : (
              <div />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
