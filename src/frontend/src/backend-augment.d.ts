import type { Principal } from "@icp-sdk/core/principal";
// Module augmentation to bridge backend.ts (empty stubs) with actual method signatures.
// This makes TypeScript aware of the canister methods for both the interface and the class.
import type {
  Episode,
  EpisodeInput,
  PodcastInfo,
  UserRole,
} from "./declarations/backend.did";

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    claimAdmin(): Promise<boolean>;
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

  // Augment the Backend class to match the interface (satisfies structural type check in config.ts)
  interface Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    claimAdmin(): Promise<boolean>;
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
