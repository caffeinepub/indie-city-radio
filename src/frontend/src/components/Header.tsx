import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LogIn, Radio } from "lucide-react";

export default function Header() {
  const isAdmin = useIsAdmin();
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const navLinks = [
    { label: "EPISODES", to: "/episodes" },
    { label: "RSS FEED", to: "/rss" },
    ...(isAdmin ? [{ label: "ADMIN", to: "/admin" }] : []),
  ];

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
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-semibold tracking-widest text-wave-gray hover:text-white transition-colors duration-200"
              data-ocid={`nav.${item.label.toLowerCase().replace(" ", "_")}.link`}
            >
              {item.label}
            </Link>
          ))}

          {/* Login button — only shown when not logged in and not admin */}
          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => login()}
              className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-wave-gray hover:text-white transition-colors duration-200"
              data-ocid="nav.login.button"
              aria-label="Sign in with Internet Identity"
            >
              <LogIn className="w-3.5 h-3.5" />
              LOGIN
            </button>
          )}
        </nav>

        {/* Mobile: login or admin icon */}
        <div className="md:hidden">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => login()}
              aria-label="Login"
              className="text-wave-gray hover:text-white transition-colors"
              data-ocid="nav.login.mobile.button"
            >
              <LogIn className="w-5 h-5" />
            </button>
          ) : (
            <Radio className="w-5 h-5 text-wave-gray" />
          )}
        </div>
      </div>
    </header>
  );
}
