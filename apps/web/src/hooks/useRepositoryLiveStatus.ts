"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface RepositoryLiveStatus {
  isConnected: boolean;
  lastUpdatedAt: string | null;
}

type SocketPayload = {
  repositoryId?: string;
};

export function useRepositoryLiveStatus(repositoryId: string) {
  const [status, setStatus] = useState<RepositoryLiveStatus>({
    isConnected: socket.connected,
    lastUpdatedAt: null,
  });

  useEffect(() => {
    function handleConnect() {
      setStatus((current) => ({
        ...current,
        isConnected: true,
      }));
    }

    function handleDisconnect() {
      setStatus((current) => ({
        ...current,
        isConnected: false,
      }));
    }

    function handleRepositoryEvent(payload?: SocketPayload) {
      if (!payload?.repositoryId) return;

      if (payload.repositoryId !== repositoryId) return;

      setStatus((current) => ({
        ...current,
        lastUpdatedAt: new Date().toISOString(),
      }));
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("engineering-event:processed", handleRepositoryEvent);
    socket.on("architecture-change:detected", handleRepositoryEvent);
    socket.on("queue-job:completed", handleRepositoryEvent);
    socket.on("repository:updated", handleRepositoryEvent);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socket.off("engineering-event:processed", handleRepositoryEvent);
      socket.off("architecture-change:detected", handleRepositoryEvent);
      socket.off("queue-job:completed", handleRepositoryEvent);
      socket.off("repository:updated", handleRepositoryEvent);
    };
  }, [repositoryId]);

  return status;
}