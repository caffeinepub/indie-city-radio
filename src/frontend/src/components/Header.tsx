import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-wave-border"
      style={{ background: "#12131A" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Radio className="w-6 h-6 text-wave-blue" />
          </div>
          <span
            className="font-display font-extrabold text-xl tracking-wider text-white"
            style={{ letterSpacing: "0.15em" }}
          >
            <span className="gradient-text">INDIE CITY</span>
            <span className="text-white ml-1">RADIO</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "EPISODES", to: "/" },
            { label: "RSS FEED", to: "/rss" },
            { label: "ADMIN", to: "/admin" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-semibold tracking-widest text-wave-gray hover:text-white transition-colors duration-200"
              data-ocid={`nav.${item.label.toLowerCase().replace(" ", "_")}.link`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu placeholder */}
        <div className="md:hidden">
          <Radio className="w-5 h-5 text-wave-gray" />
        </div>
      </div>
    </header>
  );
}
