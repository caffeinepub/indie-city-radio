import { Link } from "@tanstack/react-router";
import { ArrowRight, Radio } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
  return (
    <div className="grid-bg">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "560px" }}
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
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(71,188,150,0.06) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-32">
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
              <Link
                to="/episodes"
                className="gradient-btn text-[#0B0D12] font-bold px-8 py-3.5 rounded-full text-sm tracking-widest uppercase shadow-glow hover:opacity-90 transition-opacity"
                data-ocid="hero.start_listening.button"
              >
                Start Listening
              </Link>
              <Link
                to="/rss"
                className="border border-wave-border text-wave-gray font-semibold px-8 py-3.5 rounded-full text-sm tracking-widest uppercase hover:border-wave-blue hover:text-white transition-colors"
                data-ocid="hero.rss_feed.link"
              >
                RSS Feed
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Browse link */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex justify-center py-8"
      >
        <Link
          to="/episodes"
          className="flex items-center gap-2 text-sm text-wave-gray/70 hover:text-wave-blue transition-colors group"
          data-ocid="hero.browse_episodes.link"
        >
          Browse all episodes
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
