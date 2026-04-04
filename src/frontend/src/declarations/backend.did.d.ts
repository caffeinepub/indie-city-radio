/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

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
  explicit: boolean;
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
  explicit: boolean;
}

export interface PodcastInfo {
  stationName: string;
  description: string;
  websiteUrl: string;
  author: string;
  language: string;
  category: string;
}

export interface _SERVICE {
  isCallerAdmin: ActorMethod<[], boolean>;
  createEpisode: ActorMethod<[EpisodeInput], bigint>;
  updateEpisode: ActorMethod<[bigint, EpisodeInput], boolean>;
  deleteEpisode: ActorMethod<[bigint], boolean>;
  getEpisode: ActorMethod<[bigint], [] | [Episode]>;
  getEpisodes: ActorMethod<[], Episode[]>;
  getAllEpisodes: ActorMethod<[], Episode[]>;
  setPodcastInfo: ActorMethod<[PodcastInfo], undefined>;
  getPodcastInfo: ActorMethod<[], PodcastInfo>;
  getRssFeed: ActorMethod<[], string>;
}

export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
