import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Radio } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import EpisodeCard from "../components/EpisodeCard";
import { usePublishedEpisodes } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

export default function HomePage() {
  const episodesRef = useRef<HTMLElement>(null);
  const { data: episodes, isLoading } = usePublishedEpisodes();
  const { getFileUrl } = useStorageClient();

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="grid-bg">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "420px" }}
        data-ocid="hero.section"
      >
        {/* Neon arcs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute -left-32 -top-32 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(71,188,150,0.18) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(71,188,150,0.15) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold tracking-[0.4em] text-wave-blue mb-4 uppercase">
              <Radio className="inline w-3 h-3 mr-2" />
              Broadcasting Live
            </p>
            <h1
              className="font-display font-black text-5xl md:text-7xl text-white uppercase leading-none mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              Your Sonic
              <br />
              <span className="gradient-text">Universe</span>
            </h1>
            <p className="text-wave-gray text-lg max-w-lg mx-auto mb-10">
              Curated episodes from the cutting edge of music, culture, and
              sound. Subscribe. Tune in. Transcend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={scrollToEpisodes}
                className="gradient-btn text-white font-bold px-8 py-3.5 rounded-full text-sm tracking-widest uppercase shadow-glow hover:opacity-90 transition-opacity"
                data-ocid="hero.start_listening.button"
              >
                Start Listening
              </button>
              <Link
                to="/rss"
                className="border border-wave-border text-wave-gray font-semibold px-8 py-3.5 rounded-full text-sm tracking-widest uppercase hover:border-wave-blue hover:text-white transition-colors"
                data-ocid="hero.rss_feed.link"
              >
                RSS Feed
              </Link>
            </div>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            onClick={scrollToEpisodes}
            className="absolute bottom-6 text-wave-gray/40 hover:text-wave-gray transition-colors animate-bounce"
            aria-label="Scroll to episodes"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </div>
      </section>

      {/* Episodes Grid */}
      <section
        id="episodes"
        ref={episodesRef}
        className="max-w-7xl mx-auto px-6 py-16"
        data-ocid="episodes.section"
      >
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-wave-blue uppercase mb-2">
              All Episodes
            </p>
            <h2 className="font-display font-bold text-3xl text-white">
              Latest Podcast Episodes
            </h2>
          </div>
          {episodes && episodes.length > 0 && (
            <span className="text-wave-gray text-sm">
              {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl overflow-hidden border border-wave-border"
                style={{ background: "#1A1C24" }}
              >
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : episodes && episodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode, index) => (
              <EpisodeCard
                key={episode.id.toString()}
                episode={episode}
                index={index}
                getFileUrl={getFileUrl}
              />
            ))}
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
