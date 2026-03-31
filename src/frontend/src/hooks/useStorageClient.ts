import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorageClient() {
  const { identity } = useInternetIdentity();

  const { data: config } = useQuery({
    queryKey: ["appConfig"],
    queryFn: loadConfig,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const storageClient = useMemo(() => {
    if (!config) return null;
    const agent = new HttpAgent({
      host: config.backend_host,
      identity: identity ?? undefined,
    });
    if (config.backend_host?.includes("localhost")) {
      agent.fetchRootKey().catch(console.error);
    }
    return new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
  }, [config, identity]);

  const getFileUrl = useMemo(() => {
    if (!config) return (_fileId: string) => "";
    return (fileId: string): string => {
      if (!fileId) return "";
      return `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(fileId)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
    };
  }, [config]);

  return { storageClient, getFileUrl, configLoaded: !!config };
}
