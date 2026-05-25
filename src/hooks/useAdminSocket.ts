"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import type { TypingState } from "./useSocket";

export interface UserPresence {
  id: string;
  name: string;
  email: string;
  devices: string[];
  typing: TypingState | null;
  connected: boolean;
}

export function useAdminSocket() {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;

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
            query: { device: "Admin" },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
          }
        );

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("connect_error", (err) =>
          console.error("Admin socket error:", err.message)
        );

        socket.on("presence:all", (data: UserPresence[]) => {
          setUsers(data);
        });

        socketRef.current = socket;
      } catch (err) {
        console.error("Admin socket setup failed:", err);
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
  }, [session?.user?.id, status, session?.user?.role]);

  return { users, connected };
}
