import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AdminPage from "./pages/AdminPage";
import EpisodePage from "./pages/EpisodePage";
import HomePage from "./pages/HomePage";
import RssPage from "./pages/RssPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-wave-dark">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  ),
  // Catch TanStack Router's internal not-found and show home page
  notFoundComponent: () => <HomePage />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const episodeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/episode/$id",
  component: function EpisodeRouteWrapper() {
    const { id } = episodeRoute.useParams();
    return <EpisodePage id={id} />;
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const rssRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rss",
  component: RssPage,
});

// Wildcard fallback renders home page instead of "Not Found"
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: HomePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  episodeRoute,
  adminRoute,
  rssRoute,
  notFoundRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <RouterProvider router={router} />;
}
