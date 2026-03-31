import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface Episode {
  id: bigint;
  title: string;
  description: string;
  showNotes: string;
  publishedDate: string;
  duration: string;
  audioFileId: string;
  artworkFileId: string;
  published: boolean;
  createdAt: bigint;
}

export interface EpisodeInput {
  title: string;
  description: string;
  showNotes: string;
  publishedDate: string;
  duration: string;
  audioFileId: string;
  artworkFileId: string;
  published: boolean;
}

export interface PodcastInfo {
  stationName: string;
  description: string;
  websiteUrl: string;
  author: string;
  language: string;
  category: string;
}

export interface backendInterface {
  // Admin
  isCallerAdmin(): Promise<boolean>;

  // Episodes
  createEpisode(input: EpisodeInput): Promise<bigint>;
  updateEpisode(id: bigint, input: EpisodeInput): Promise<boolean>;
  deleteEpisode(id: bigint): Promise<boolean>;
  getEpisode(id: bigint): Promise<[] | [Episode]>;
  getEpisodes(): Promise<Episode[]>;
  getAllEpisodes(): Promise<Episode[]>;

  // Podcast info
  setPodcastInfo(info: PodcastInfo): Promise<void>;
  getPodcastInfo(): Promise<PodcastInfo>;

  // RSS
  getRssFeed(): Promise<string>;
}
