import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Link } from "@tanstack/react-router";
import { Heart, Radio } from "lucide-react";
import { SiApplepodcasts, SiSpotify } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const isAdmin = useIsAdmin();

  const navLinks = [
    { label: "Episodes", to: "/" },
    { label: "RSS Feed", to: "/rss" },
    ...(isAdmin ? [{ label: "Admin", to: "/admin" }] : []),
  ];

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
              {navLinks.map((item) => (
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
            <div className="flex gap-4 items-center">
              {/* RSS — PNG, white via filter, orange on hover */}
              <a
                href="https://rss.com/podcasts/indie-city/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RSS Feed"
                className="listen-on-icon-png listen-on-rss transition-transform duration-200 ease-in-out hover:scale-110 inline-flex"
              >
                <img
                  src="/assets/rss-512-019d69ed-80bf-72ef-9298-7f756155c409.png"
                  alt="RSS"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </a>

              {/* Spotify — SVG icon, white → green */}
              <a
                href="https://open.spotify.com/show/0piAWFQ72tvDyJSztrUL5F?si=67e79c0cd9794e27"
                target="_blank"
                rel="noopener noreferrer"
                className="listen-on-icon-svg listen-on-spotify transition-transform duration-200 hover:scale-110 inline-flex"
                aria-label="Spotify"
              >
                <SiSpotify size={32} />
              </a>

              {/* Apple Podcasts — SVG icon, white → purple */}
              <a
                href="https://podcasts.apple.com/us/podcast/indie-city-radio/id1890787320"
                target="_blank"
                rel="noopener noreferrer"
                className="listen-on-icon-svg listen-on-apple transition-transform duration-200 hover:scale-110 inline-flex"
                aria-label="Apple Podcasts"
              >
                <SiApplepodcasts size={32} />
              </a>

              {/* Amazon — PNG, white via filter, brand color on hover */}
              <a
                href="https://music.amazon.com/podcasts/3c304fe9-e4e3-4079-8d7e-bc831ddf3937/indie-city-radio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Amazon Music"
                className="listen-on-icon-png listen-on-amazon transition-transform duration-200 ease-in-out hover:scale-110 inline-flex"
              >
                <img
                  src="/assets/amazon-music2-019d69ed-811a-764d-8de3-95cd13f26c11.png"
                  alt="Amazon Music"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
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
