import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// Local type definitions for backend episode/podcast data model
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

export function usePublishedEpisodes() {
  const { actor, isFetching } = useActor();
  return useQuery<Episode[]>({
    queryKey: ["episodes"],
    queryFn: async (): Promise<Episode[]> => {
      if (!actor) return [];
      return (
        actor as unknown as { getEpisodes(): Promise<Episode[]> }
      ).getEpisodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllEpisodes() {
  const { actor, isFetching } = useActor();
  return useQuery<Episode[]>({
    queryKey: ["allEpisodes"],
    queryFn: async (): Promise<Episode[]> => {
      if (!actor) return [];
      return (
        actor as unknown as { getAllEpisodes(): Promise<Episode[]> }
      ).getAllEpisodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEpisode(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Episode | null>({
    queryKey: ["episode", id.toString()],
    queryFn: async (): Promise<Episode | null> => {
      if (!actor) return null;
      const result = await (
        actor as unknown as { getEpisode(id: bigint): Promise<[] | [Episode]> }
      ).getEpisode(id);
      if (result.length > 0) return result[0] as Episode;
      return null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePodcastInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<PodcastInfo>({
    queryKey: ["podcastInfo"],
    queryFn: async (): Promise<PodcastInfo> => {
      if (!actor)
        return {
          stationName: "",
          description: "",
          websiteUrl: "",
          author: "",
          language: "en",
          category: "",
        };
      return (
        actor as unknown as { getPodcastInfo(): Promise<PodcastInfo> }
      ).getPodcastInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRssFeedQuery() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["rssFeed"],
    queryFn: async (): Promise<string> => {
      if (!actor) return "";
      return (
        actor as unknown as { getRssFeed(): Promise<string> }
      ).getRssFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EpisodeInput): Promise<bigint> => {
      if (!actor) throw new Error("Not connected");
      return (
        actor as unknown as {
          createEpisode(input: EpisodeInput): Promise<bigint>;
        }
      ).createEpisode(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
    },
  });
}

export function useUpdateEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: EpisodeInput;
    }): Promise<boolean> => {
      if (!actor) throw new Error("Not connected");
      return (
        actor as unknown as {
          updateEpisode(id: bigint, input: EpisodeInput): Promise<boolean>;
        }
      ).updateEpisode(id, input);
    },
    onSuccess: (
      _data: boolean,
      { id }: { id: bigint; input: EpisodeInput },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
      queryClient.invalidateQueries({ queryKey: ["episode", id.toString()] });
    },
  });
}

export function useDeleteEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint): Promise<boolean> => {
      if (!actor) throw new Error("Not connected");
      return (
        actor as unknown as { deleteEpisode(id: bigint): Promise<boolean> }
      ).deleteEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
    },
  });
}

export function useSetPodcastInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (info: PodcastInfo): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      return (
        actor as unknown as { setPodcastInfo(info: PodcastInfo): Promise<void> }
      ).setPodcastInfo(info);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcastInfo"] });
    },
  });
}
