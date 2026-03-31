// Module augmentation to bridge backend.ts (empty stubs) with actual method signatures.
import type {
  Episode,
  EpisodeInput,
  PodcastInfo,
} from "./declarations/backend.did";

declare module "./backend" {
  interface backendInterface {
    isCallerAdmin(): Promise<boolean>;
    createEpisode(input: EpisodeInput): Promise<bigint>;
    updateEpisode(id: bigint, input: EpisodeInput): Promise<boolean>;
    deleteEpisode(id: bigint): Promise<boolean>;
    getEpisode(id: bigint): Promise<[] | [Episode]>;
    getEpisodes(): Promise<Episode[]>;
    getAllEpisodes(): Promise<Episode[]>;
    setPodcastInfo(info: PodcastInfo): Promise<void>;
    getPodcastInfo(): Promise<PodcastInfo>;
    getRssFeed(): Promise<string>;
  }

  interface Backend {
    isCallerAdmin(): Promise<boolean>;
    createEpisode(input: EpisodeInput): Promise<bigint>;
    updateEpisode(id: bigint, input: EpisodeInput): Promise<boolean>;
    deleteEpisode(id: bigint): Promise<boolean>;
    getEpisode(id: bigint): Promise<[] | [Episode]>;
    getEpisodes(): Promise<Episode[]>;
    getAllEpisodes(): Promise<Episode[]>;
    setPodcastInfo(info: PodcastInfo): Promise<void>;
    getPodcastInfo(): Promise<PodcastInfo>;
    getRssFeed(): Promise<string>;
  }
}
