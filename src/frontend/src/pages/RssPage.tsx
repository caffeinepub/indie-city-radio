import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy, ExternalLink, Rss } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SiApplepodcasts, SiSpotify } from "react-icons/si";
import { toast } from "sonner";
import { usePodcastInfo, useRssFeed } from "../hooks/useQueries";

export default function RssPage() {
  const [copied, setCopied] = useState(false);
  const { data: rssFeed, isLoading: feedLoading } = useRssFeed();
  const { data: podcastInfo } = usePodcastInfo();

  const feedUrl = `${window.location.origin}${window.location.pathname}#/rss-feed`;

  const copyUrl = () => {
    navigator.clipboard.writeText(feedUrl).then(() => {
      setCopied(true);
      toast.success("RSS feed URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mx-auto shadow-glow">
              <Rss className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-black text-4xl text-white">
              RSS Feed
            </h1>
            <p className="text-wave-gray max-w-md mx-auto">
              Subscribe to{" "}
              <strong className="text-white">
                {podcastInfo?.stationName || "WAVE RADIO"}
              </strong>{" "}
              on your favourite podcast app using the feed URL below.
            </p>
          </div>

          {/* Feed URL */}
          <div
            className="rounded-2xl border border-wave-border p-6"
            style={{ background: "#1A1C24" }}
            data-ocid="rss.panel"
          >
            <p className="text-xs font-semibold tracking-widest text-wave-blue uppercase mb-3">
              Feed URL
            </p>
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-xl border border-wave-border px-4 py-3 text-sm text-wave-gray font-mono truncate"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {feedUrl}
              </div>
              <button
                type="button"
                onClick={copyUrl}
                className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-btn text-white text-sm font-semibold transition-opacity hover:opacity-90 shadow-glow flex-shrink-0"
                data-ocid="rss.copy_url.button"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>

          {/* Directory cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border border-wave-border p-6 space-y-4"
              style={{ background: "#1A1C24" }}
            >
              <div className="flex items-center gap-3">
                <SiSpotify size={28} className="text-green-400" />
                <h3 className="font-display font-bold text-white">Spotify</h3>
              </div>
              <p className="text-sm text-wave-gray">
                Go to Spotify for Podcasters, create an account, and paste the
                RSS URL to import your show.
              </p>
              <a
                href="https://podcasters.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Open Spotify for Podcasters{" "}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div
              className="rounded-2xl border border-wave-border p-6 space-y-4"
              style={{ background: "#1A1C24" }}
            >
              <div className="flex items-center gap-3">
                <SiApplepodcasts size={28} className="text-[#B150E2]" />
                <h3 className="font-display font-bold text-white">
                  Apple Podcasts
                </h3>
              </div>
              <p className="text-sm text-wave-gray">
                Submit your show via Apple Podcasts Connect. Paste the RSS URL
                and follow the submission steps.
              </p>
              <a
                href="https://podcastsconnect.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#B150E2] hover:text-purple-300 transition-colors"
              >
                Open Apple Podcasts Connect{" "}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* RSS XML preview */}
          {feedLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : rssFeed ? (
            <div
              className="rounded-2xl border border-wave-border p-6"
              style={{ background: "#1A1C24" }}
            >
              <p className="text-xs font-semibold tracking-widest text-wave-blue uppercase mb-3">
                Feed Preview (XML)
              </p>
              <pre className="text-xs text-wave-gray/70 overflow-x-auto max-h-48 scrollbar-thin">
                {rssFeed.slice(0, 800)}
                {rssFeed.length > 800 ? "\n..." : ""}
              </pre>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
