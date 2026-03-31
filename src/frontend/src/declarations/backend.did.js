// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const Episode = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    description: IDL.Text,
    showNotes: IDL.Text,
    publishedDate: IDL.Text,
    duration: IDL.Text,
    audioFileId: IDL.Text,
    artworkFileId: IDL.Text,
    published: IDL.Bool,
    createdAt: IDL.Int,
  });
  const EpisodeInput = IDL.Record({
    title: IDL.Text,
    description: IDL.Text,
    showNotes: IDL.Text,
    publishedDate: IDL.Text,
    duration: IDL.Text,
    audioFileId: IDL.Text,
    artworkFileId: IDL.Text,
    published: IDL.Bool,
  });
  const PodcastInfo = IDL.Record({
    stationName: IDL.Text,
    description: IDL.Text,
    websiteUrl: IDL.Text,
    author: IDL.Text,
    language: IDL.Text,
    category: IDL.Text,
  });
  const UserRole = IDL.Variant({
    admin: IDL.Null,
    user: IDL.Null,
    guest: IDL.Null,
  });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    getCallerUserRole: IDL.Func([], [UserRole], ['query']),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
    claimAdmin: IDL.Func([], [IDL.Bool], []),
    createEpisode: IDL.Func([EpisodeInput], [IDL.Nat], []),
    updateEpisode: IDL.Func([IDL.Nat, EpisodeInput], [IDL.Bool], []),
    deleteEpisode: IDL.Func([IDL.Nat], [IDL.Bool], []),
    getEpisode: IDL.Func([IDL.Nat], [IDL.Opt(Episode)], ['query']),
    getEpisodes: IDL.Func([], [IDL.Vec(Episode)], ['query']),
    getAllEpisodes: IDL.Func([], [IDL.Vec(Episode)], ['query']),
    setPodcastInfo: IDL.Func([PodcastInfo], [], []),
    getPodcastInfo: IDL.Func([], [PodcastInfo], ['query']),
    getRssFeed: IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => [];
