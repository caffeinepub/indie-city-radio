import {
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Actor } from "@icp-sdk/core/agent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { idlFactory } from "../declarations/backend.did";

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorQuery = useQuery({
    queryKey: ["actor", identity?.getPrincipal().toString() ?? "anon"],
    queryFn: async () => {
      const config = await loadConfig();
      const agent = HttpAgent.createSync({
        host: config.backend_host,
        identity: identity ?? undefined,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey();
      }
      return Actor.createActor(idlFactory, {
        agent,
        canisterId: config.backend_canister_id,
      });
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (q) => !q.queryKey.includes("actor"),
      });
    }
  }, [actorQuery.data, queryClient]);

  return { actor: actorQuery.data ?? null, isFetching: actorQuery.isFetching };
}
