import { Link } from "@tanstack/react-router";
import { Heart, Radio } from "lucide-react";
import { SiApplepodcasts, SiInstagram, SiSpotify, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <footer
      className="border-t border-wave-border mt-auto"
      style={{ background: "#12131A" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-wave-blue" />
              <span className="font-display font-extrabold text-lg tracking-widest">
                <span className="gradient-text">INDIE CITY</span>
                <span className="text-white ml-1">RADIO</span>
              </span>
            </div>
            <p className="text-sm text-wave-gray leading-relaxed">
              Your home for independent music, curated shows, and the best of
              the indie scene.
            </p>
            <p className="text-xs text-wave-gray/60">
              &copy; {year} INDIE CITY RADIO. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest text-white uppercase">
              Navigate
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Episodes", to: "/" },
                { label: "RSS Feed", to: "/rss" },
                { label: "Admin", to: "/admin" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm text-wave-gray hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest text-white uppercase">
              Listen On
            </h4>
            <div className="flex gap-4">
              <a
                href="https://podcasters.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wave-gray hover:text-green-400 transition-colors"
                aria-label="Spotify"
              >
                <SiSpotify size={22} />
              </a>
              <a
                href="https://podcastsconnect.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wave-gray hover:text-[#B150E2] transition-colors"
                aria-label="Apple Podcasts"
              >
                <SiApplepodcasts size={22} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wave-gray hover:text-white transition-colors"
                aria-label="X / Twitter"
              >
                <SiX size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wave-gray hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-wave-border flex justify-center">
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-wave-gray/50 hover:text-wave-gray transition-colors flex items-center gap-1"
          >
            Built with <Heart className="w-3 h-3 text-wave-red fill-wave-red" />{" "}
            using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
