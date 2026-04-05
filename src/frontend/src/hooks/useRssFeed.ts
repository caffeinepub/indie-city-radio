import { useQuery } from "@tanstack/react-query";

export interface RssEpisode {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  artworkUrl: string;
  showNotes: string;
}

const RSS_FEED_URL = "https://media.rss.com/indie-city/feed.xml";

function getText(el: Element | null, tag: string): string {
  if (!el) return "";
  const node = el.querySelector(tag);
  return node?.textContent?.trim() ?? "";
}

function getAttr(el: Element | null, tag: string, attr: string): string {
  if (!el) return "";
  const node = el.querySelector(tag);
  return node?.getAttribute(attr) ?? "";
}

function parseRssFeed(xmlText: string): RssEpisode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const channel = doc.querySelector("channel");
  if (!channel) return [];

  // Channel-level artwork fallback
  const channelImage =
    channel.querySelector("itunes\\:image")?.getAttribute("href") ??
    channel.querySelector("image > url")?.textContent?.trim() ??
    "";

  const items = Array.from(doc.querySelectorAll("item"));

  return items.map((item): RssEpisode => {
    const guid =
      item.querySelector("guid")?.textContent?.trim() ??
      getText(item, "title") ??
      Math.random().toString(36).slice(2);

    const title = getText(item, "title");

    const description =
      getText(item, "itunes\\:summary") || getText(item, "description") || "";

    const pubDate = getText(item, "pubDate");

    const duration = getText(item, "itunes\\:duration");

    const audioUrl = getAttr(item, "enclosure", "url");

    const artworkUrl =
      item.querySelector("itunes\\:image")?.getAttribute("href") ??
      channelImage;

    // content:encoded for show notes
    const contentEncoded =
      item.querySelector("content\\:encoded")?.textContent?.trim() ?? "";

    return {
      guid,
      title,
      description,
      pubDate,
      duration,
      audioUrl,
      artworkUrl,
      showNotes: contentEncoded,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    episodes: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
