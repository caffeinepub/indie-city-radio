import { useQuery } from "@tanstack/react-query";

export interface RssChapter {
  startTime: number; // seconds
  title: string;
  imageUrl?: string;
  url?: string;
}

export interface RssEpisode {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  artworkUrl: string;
  showNotes: string;
  chapters: RssChapter[];
  chaptersUrl?: string;
}

const RSS_FEED_URL = "https://media.rss.com/indie-city/feed.xml";
const ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd";
const CONTENT_NS = "http://purl.org/rss/1.0/modules/content/";
const PSC_NS = "http://podlove.org/simple-chapters";
const PODCAST_NS = "https://podcastindex.org/namespace/1.0";

function getTextNS(el: Element, localName: string, ns: string): string {
  const nodes = el.getElementsByTagNameNS(ns, localName);
  return nodes[0]?.textContent?.trim() ?? "";
}

function getAttrNS(
  el: Element,
  localName: string,
  ns: string,
  attr: string,
): string {
  const nodes = el.getElementsByTagNameNS(ns, localName);
  return nodes[0]?.getAttribute(attr) ?? "";
}

function getText(el: Element, tag: string): string {
  const node = el.querySelector(tag);
  return node?.textContent?.trim() ?? "";
}

/**
 * Parse a timestamp string like "HH:MM:SS" or "MM:SS" or "SS" to seconds.
 */
function parseTimestamp(ts: string): number {
  if (!ts) return 0;
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

/**
 * Format seconds to MM:SS or HH:MM:SS for display.
 */
export function formatChapterTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Format an iTunes duration string ("HH:MM:SS", "MM:SS", or raw seconds)
 * into a human-readable "#h #m" string. Examples: "1h 12m", "52m".
 */
export function formatDuration(duration: string): string {
  if (!duration) return "";

  let totalSeconds: number;

  if (duration.includes(":")) {
    totalSeconds = parseTimestamp(duration);
  } else {
    // Raw seconds as a number string
    totalSeconds = Number.parseInt(duration, 10);
    if (Number.isNaN(totalSeconds)) return duration;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function parseChapters(item: Element): {
  chapters: RssChapter[];
  chaptersUrl?: string;
} {
  // 1. Podlove Simple Chapters (psc:chapters / psc:chapter)
  const pscParent = item.getElementsByTagNameNS(PSC_NS, "chapters")[0];
  if (pscParent) {
    const chapterEls = Array.from(
      pscParent.getElementsByTagNameNS(PSC_NS, "chapter"),
    );
    if (chapterEls.length > 0) {
      return {
        chapters: chapterEls.map((c) => ({
          startTime: parseTimestamp(c.getAttribute("start") ?? ""),
          title: c.getAttribute("title") ?? "",
          imageUrl: c.getAttribute("image") ?? undefined,
          url: c.getAttribute("href") ?? undefined,
        })),
      };
    }
  }

  // 2. Podcasting 2.0 namespace chapters URL
  const podcastChapters = item.getElementsByTagNameNS(
    PODCAST_NS,
    "chapters",
  )[0];
  if (podcastChapters) {
    const chaptersUrl = podcastChapters.getAttribute("url") ?? undefined;
    if (chaptersUrl) {
      return { chapters: [], chaptersUrl };
    }
  }

  // 3. Also try unnamespaced <chapters> for feeds that omit namespace prefix
  const fallbackChapters = item.querySelector("chapters");
  if (fallbackChapters) {
    const chapterEls = Array.from(fallbackChapters.querySelectorAll("chapter"));
    if (chapterEls.length > 0) {
      return {
        chapters: chapterEls.map((c) => ({
          startTime: parseTimestamp(c.getAttribute("start") ?? ""),
          title: c.getAttribute("title") ?? "",
          imageUrl: c.getAttribute("image") ?? undefined,
          url: c.getAttribute("href") ?? undefined,
        })),
      };
    }
  }

  return { chapters: [] };
}

function parseRssFeed(xmlText: string): RssEpisode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const channel = doc.querySelector("channel");
  if (!channel) return [];

  const channelImage =
    getAttrNS(channel, "image", ITUNES_NS, "href") ||
    channel.querySelector("image > url")?.textContent?.trim() ||
    "";

  const items = Array.from(doc.querySelectorAll("item"));

  return items.map((item): RssEpisode => {
    const guid =
      item.querySelector("guid")?.textContent?.trim() ||
      getText(item, "title") ||
      Math.random().toString(36).slice(2);

    const title = getText(item, "title");

    const description =
      getTextNS(item, "summary", ITUNES_NS) ||
      getText(item, "description") ||
      "";

    const pubDate = getText(item, "pubDate");
    const duration = getTextNS(item, "duration", ITUNES_NS);
    const audioUrl = item.querySelector("enclosure")?.getAttribute("url") ?? "";

    // Episode-specific artwork via proper namespace lookup, fall back to channel artwork
    const artworkUrl =
      getAttrNS(item, "image", ITUNES_NS, "href") || channelImage;

    const contentEncoded =
      item
        .getElementsByTagNameNS(CONTENT_NS, "encoded")[0]
        ?.textContent?.trim() ?? "";

    const { chapters, chaptersUrl } = parseChapters(item);

    return {
      guid,
      title,
      description,
      pubDate,
      duration,
      audioUrl,
      artworkUrl,
      showNotes: contentEncoded,
      chapters,
      chaptersUrl,
    };
  });
}

async function fetchRssFeed(): Promise<RssEpisode[]> {
  const res = await fetch(RSS_FEED_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch RSS feed: ${res.status}`);
  }
  const text = await res.text();
  return parseRssFeed(text);
}

export function useRssFeed() {
  const { data, isLoading, error } = useQuery<RssEpisode[], Error>({
    queryKey: ["rss-feed"],
    queryFn: fetchRssFeed,
    staleTime: 1000 * 60 * 5,
  });

  return {
    episodes: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
