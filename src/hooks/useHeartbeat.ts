import { useEffect, useState } from "react";
import { heartbeat } from "@/lib/rooms.functions";

/** Envía señal de vida y expone el estado de conexión del jugador. */
export function useHeartbeat(playerId?: string, token?: string) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!playerId || !token) return;
    let cancelled = false;
    const ping = async () => {
      try {
        await heartbeat({ data: { playerId, token } });
        if (!cancelled) setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    };
    void ping();
    const id = window.setInterval(ping, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [playerId, token]);

  return online;
}
