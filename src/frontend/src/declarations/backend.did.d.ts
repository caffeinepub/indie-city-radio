/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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

export type UserRole = { admin: null } | { user: null } | { guest: null };

export interface _SERVICE {
  _initializeAccessControlWithSecret: ActorMethod<[string], undefined>;
  getCallerUserRole: ActorMethod<[], UserRole>;
  assignCallerUserRole: ActorMethod<[Principal, UserRole], undefined>;
  isCallerAdmin: ActorMethod<[], boolean>;
  claimAdmin: ActorMethod<[], boolean>;
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
