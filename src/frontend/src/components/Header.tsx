import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Radio } from "lucide-react";

export default function Header() {
  const isAdmin = useIsAdmin();
  const {
    identity,
    login,
    clear: logout,
    loginStatus,
    isInitializing,
  } = useInternetIdentity();

  // Auth state is only confirmed once initialization is done.
  // During initialization, treat as "not logged in" so Login button shows
  // immediately rather than flashing in/out.
  const isLoggedIn = !isInitializing && !!identity;
  // loginStatus === "logging-in" means user clicked Login and popup is open
  const isLoggingIn = loginStatus === "logging-in";

  const navLinks = [
    { label: "EPISODES", to: "/episodes" },
    { label: "RSS FEED", to: "/rss" },
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

        {/* Desktop Nav */}
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

          {/* Submit Music — external link */}
          <a
            href="https://indiecity-music-ar6.caffeine.xyz/submit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold tracking-widest text-wave-blue hover:text-white border border-wave-blue/40 hover:border-wave-blue px-3 py-1 rounded-full transition-colors duration-200"
            data-ocid="nav.submit_music.link"
          >
            SUBMIT MUSIC
          </a>

          {/* Admin link — only for admins that are logged in */}
          {isLoggedIn && isAdmin && (
            <Link
              to="/admin"
              className="text-xs font-semibold tracking-widest text-wave-gray hover:text-white transition-colors duration-200"
              data-ocid="nav.admin.link"
            >
              ADMIN
            </Link>
          )}

          {/* Login button — always shown when not logged in (including during init) */}
          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-wave-gray hover:text-white transition-colors duration-200 disabled:opacity-50"
              data-ocid="nav.login.button"
              aria-label="Sign in with Internet Identity"
            >
              <LogIn className="w-3.5 h-3.5" />
              {isLoggingIn ? "SIGNING IN..." : "LOGIN"}
            </button>
          )}

          {/* Logout button — shown when logged in */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-wave-gray hover:text-white transition-colors duration-200"
              data-ocid="nav.logout.button"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-3">
          <a
            href="https://indiecity-music-ar6.caffeine.xyz/submit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold tracking-widest text-wave-blue border border-wave-blue/40 px-2 py-0.5 rounded-full"
            data-ocid="nav.submit_music.mobile.link"
          >
            SUBMIT
          </a>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => logout()}
              aria-label="Logout"
              className="text-wave-gray hover:text-white transition-colors"
              data-ocid="nav.logout.mobile.button"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => login()}
              disabled={isLoggingIn}
              aria-label="Login"
              className="text-wave-gray hover:text-white transition-colors disabled:opacity-50"
              data-ocid="nav.login.mobile.button"
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
