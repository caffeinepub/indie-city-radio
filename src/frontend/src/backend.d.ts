import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PodcastInfo {
    websiteUrl: string;
    description: string;
    author: string;
    language: string;
    category: string;
    stationName: string;
}
export interface EpisodeInput {
    title: string;
    duration: string;
    publishedDate: string;
    published: boolean;
    explicit: boolean;
    audioFileId: string;
    description: string;
    artworkFileId: string;
    showNotes: string;
}
export interface Episode {
    id: bigint;
    title: string;
    duration: string;
    publishedDate: string;
    published: boolean;
    createdAt: bigint;
    explicit: boolean;
    audioFileId: string;
    description: string;
    artworkFileId: string;
    showNotes: string;
}
export interface backendInterface {
    createEpisode(input: EpisodeInput): Promise<bigint>;
    deleteEpisode(id: bigint): Promise<boolean>;
    getAllEpisodes(): Promise<Array<Episode>>;
    getEpisode(id: bigint): Promise<Episode | null>;
    getEpisodes(): Promise<Array<Episode>>;
    getPodcastInfo(): Promise<PodcastInfo>;
    getRssFeed(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    setPodcastInfo(info: PodcastInfo): Promise<void>;
    updateEpisode(id: bigint, input: EpisodeInput): Promise<boolean>;
}
