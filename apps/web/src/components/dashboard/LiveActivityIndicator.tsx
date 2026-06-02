"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { socket } from "@/lib/socket";

export function LiveActivityIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    setIsConnected(socket.connected);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <Radio
        className={`h-3.5 w-3.5 ${
          isConnected ? "text-emerald-500" : "text-muted-foreground"
        }`}
      />

      <span>{isConnected ? "Live updates connected" : "Live updates offline"}</span>
    </div>
  );
}