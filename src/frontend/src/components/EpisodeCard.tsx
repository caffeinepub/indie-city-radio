import { useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Episode } from "../hooks/useQueries";

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  getFileUrl: (fileId: string) => string;
}

export default function EpisodeCard({
  episode,
  index,
  getFileUrl,
}: EpisodeCardProps) {
  const navigate = useNavigate();

  const artworkUrl = episode.artworkFileId
    ? getFileUrl(episode.artworkFileId)
    : "";

  const handlePlay = () => {
    navigate({ to: "/episode/$id", params: { id: episode.id.toString() } });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative rounded-2xl overflow-hidden border border-wave-border cursor-pointer"
      style={{ background: "#1A1C24" }}
      onClick={handlePlay}
      data-ocid={`episodes.item.${index + 1}`}
    >
      {/* Artwork */}
      <div className="relative aspect-square overflow-hidden">
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={episode.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src="/assets/generated/wave-placeholder-artwork.dim_400x400.jpg"
            alt="Episode artwork"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center gradient-btn shadow-glow"
            data-ocid={`episodes.play.button.${index + 1}`}
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Episode number badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-bold tracking-widest px-2 py-1 rounded-full"
            style={{
              background: "rgba(45,156,255,0.2)",
              color: "#2D9CFF",
              border: "1px solid rgba(45,156,255,0.3)",
            }}
          >
            EP {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-white leading-tight line-clamp-2 group-hover:text-wave-blue transition-colors">
          {episode.title}
        </h3>
        <p className="text-sm text-wave-gray line-clamp-2">
          {episode.description}
        </p>
        <div className="flex items-center gap-4 pt-1">
          <span className="flex items-center gap-1.5 text-xs text-wave-gray/70">
            <Calendar className="w-3 h-3" />
            {episode.publishedDate}
          </span>
          {episode.duration && (
            <span className="flex items-center gap-1.5 text-xs text-wave-gray/70">
              <Clock className="w-3 h-3" />
              {episode.duration}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
