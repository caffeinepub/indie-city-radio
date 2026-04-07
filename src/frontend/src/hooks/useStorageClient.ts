import {
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

class StorageClient {
  constructor(
    private bucketName: string,
    private gatewayUrl: string,
    private canisterId: string,
    private projectId: string,
    private _agent: HttpAgent,
  ) {}

  async putFile(
    bytes: Uint8Array,
    onProgress?: (pct: number) => void,
  ): Promise<{ hash: string }> {
    const CHUNK = 1024 * 1024; // 1MB
    const total = bytes.length;
    const chunks = Math.ceil(total / CHUNK);
    const hash = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    for (let i = 0; i < chunks; i++) {
      const slice = bytes.slice(i * CHUNK, (i + 1) * CHUNK);
      const url = `${this.gatewayUrl}/v1/blob/upload?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(this.canisterId)}&project_id=${encodeURIComponent(this.projectId)}&chunk=${i}&total_chunks=${chunks}`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: slice,
      });
      if (onProgress) onProgress(Math.round(((i + 1) / chunks) * 100));
    }
    return { hash };
  }
}

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
