import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Episode,
  EpisodeInput,
  PodcastInfo,
} from "../declarations/backend.did";
import { useActor } from "./useActor";

export type { Episode, EpisodeInput, PodcastInfo };

export function usePublishedEpisodes() {
  const { actor, isFetching } = useActor();
  return useQuery<Episode[]>({
    queryKey: ["episodes"],
    queryFn: async (): Promise<Episode[]> => {
      if (!actor) return [];
      return actor.getEpisodes();
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
      return actor.getAllEpisodes();
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
      const result = await actor.getEpisode(id);
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
      return actor.getPodcastInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRssFeed() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["rssFeed"],
    queryFn: async (): Promise<string> => {
      if (!actor) return "";
      return actor.getRssFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async (): Promise<boolean> => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
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
      return actor.createEpisode(input);
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
      return actor.updateEpisode(id, input);
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
      return actor.deleteEpisode(id);
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
      return actor.setPodcastInfo(info);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcastInfo"] });
    },
  });
}
