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
const ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd";
const CONTENT_NS = "http://purl.org/rss/1.0/modules/content/";

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
    staleTime: 1000 * 60 * 5,
  });

  return {
    episodes: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
