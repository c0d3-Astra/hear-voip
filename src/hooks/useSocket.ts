"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export interface TypingState {
  active: boolean;
  startTimestamp: number;
  elapsed: number;
  wpm: number;
  accuracy: number;
  progress: number;
  finished: boolean;
}

export function useSocket(deviceType: string) {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    let socket: Socket | null = null;
    let cancelled = false;

    async function connect() {
      try {
        const res = await fetch("/api/auth/token");
        if (!res.ok) return;
        const { token } = await res.json();
        if (cancelled) return;

        socket = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
          {
            auth: { token },
            query: { device: deviceType },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
          }
        );

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("connect_error", (err) => {
          console.error("Socket connect error:", err.message);
        });

        socket.on("typing:sync", (data: TypingState) => setTyping(data));
        socket.on("typing:update", (data: TypingState) => setTyping(data));

        socketRef.current = socket;
      } catch (err) {
        console.error("Socket setup failed:", err);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user?.id, deviceType, status]);

  const emitTypingStart = useCallback(() => {
    socketRef.current?.emit("typing:start");
  }, []);

  const emitTypingUpdate = useCallback(
    (data: Partial<TypingState>) => {
      socketRef.current?.emit("typing:update", data);
    },
    []
  );

  const emitTypingEnd = useCallback(
    (data?: Partial<TypingState>) => {
      socketRef.current?.emit("typing:end", data);
    },
    []
  );

  const emitTypingReset = useCallback(() => {
    socketRef.current?.emit("typing:reset");
  }, []);

  return {
    typing,
    connected,
    emitTypingStart,
    emitTypingUpdate,
    emitTypingEnd,
    emitTypingReset,
  };
}
