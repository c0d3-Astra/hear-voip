"use client";

import { useState } from "react";
import { useAdminSocket, type UserPresence } from "@/hooks/useAdminSocket";
import type { TypingState } from "@/hooks/useSocket";

function formatTime(sec: number) {
  if (sec < 60) return `${Math.floor(sec)}s`;
  return `${Math.floor(sec / 60)}m ${Math.floor(sec % 60)}s`;
}

function StatsPanel({
  user,
  onClose,
}: {
  user: UserPresence & { dbUser: { name: string; email: string; role: string; createdAt: string } };
  onClose: () => void;
}) {
  const t = user.typing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-md rounded-lg border border-surface1 bg-base p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{user.dbUser.name}</h2>
          <button onClick={onClose} className="text-overlay0 hover:text-subtext1">
            ✕
          </button>
        </div>
        <dl className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-subtext0">Email</dt>
            <dd>{user.dbUser.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-subtext0">Devices</dt>
            <dd>
              {user.devices.length > 0
                ? user.devices.join(", ")
                : "None"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-subtext0">Status</dt>
            <dd>
              {user.connected ? (
                <span className="font-medium text-green">Online</span>
              ) : (
                <span className="font-medium text-overlay0">Offline</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-subtext0">Typing</dt>
            <dd>
              {t?.active ? (
                <span className="font-medium text-green">Active</span>
              ) : t?.finished ? (
                <span className="font-medium text-subtext0">Finished</span>
              ) : (
                <span className="text-overlay0">Idle</span>
              )}
            </dd>
          </div>
        </dl>

        {t && (
          <>
            <div className="mb-3 text-xs font-semibold uppercase text-overlay0">
              Live Typing Stats
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-surface1 p-3 text-center">
                <div className="text-2xl font-bold tabular-nums">{t.wpm}</div>
                <div className="text-xs text-overlay0">WPM</div>
              </div>
              <div className="rounded-lg border border-surface1 p-3 text-center">
                <div className="text-2xl font-bold tabular-nums">
                  {t.accuracy}%
                </div>
                <div className="text-xs text-overlay0">Accuracy</div>
              </div>
              <div className="rounded-lg border border-surface1 p-3 text-center">
                <div className="text-2xl font-bold tabular-nums">
                  {formatTime(t.elapsed)}
                </div>
                <div className="text-xs text-overlay0">Elapsed</div>
              </div>
              <div className="rounded-lg border border-surface1 p-3 text-center">
                <div className="text-2xl font-bold tabular-nums">
                  {t.progress}%
                </div>
                <div className="text-xs text-overlay0">Progress</div>
              </div>
            </div>
            {t.active && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
                Typing in progress
              </div>
            )}
          </>
        )}

        {!t && (
          <p className="text-sm text-overlay0">
            No typing activity yet.
          </p>
        )}
      </div>
    </div>
  );
}

interface DbUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard({
  dbUsers,
}: {
  dbUsers: DbUser[];
}) {
  const { users: liveUsers, connected } = useAdminSocket();
  const [selected, setSelected] = useState<string | null>(null);

  type Merged = UserPresence & {
    dbUser: DbUser;
  };

  const merged: Merged[] = dbUsers.map((u) => {
    const live = liveUsers.find((l) => l.id === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      dbUser: u,
      devices: live?.devices ?? [],
      typing: live?.typing ?? null,
      connected: live?.connected ?? false,
    };
  });

  const typingActive = merged.filter(
    (u) => u.typing?.active
  ).length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green" : "bg-red"
            }`}
          />
          {connected ? "Live" : "Disconnected"}
        </div>
        <span className="text-overlay0">
          {merged.filter((u) => u.connected).length} online
        </span>
        {typingActive > 0 && (
          <span className="font-medium text-green">
            {typingActive} typing now
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-surface1">
        <table className="min-w-full text-sm">
          <thead className="bg-surface0">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Devices</th>
              <th className="px-4 py-3 text-left font-medium">Typing</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {merged.map((u) => (
              <tr key={u.dbUser.id} className="hover:bg-surface0">
                <td className="px-4 py-3">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${
                      u.connected ? "bg-green" : "bg-surface1"
                    }`}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{u.dbUser.name}</td>
                <td className="px-4 py-3 text-subtext0">{u.dbUser.email}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {u.devices.includes("PC") && (
                      <span className="rounded bg-mantle px-1.5 py-0.5 text-xs font-medium text-blue">
                        PC
                      </span>
                    )}
                    {u.devices.includes("Mobile") && (
                      <span className="rounded bg-mantle px-1.5 py-0.5 text-xs font-medium text-green">
                        Mobile
                      </span>
                    )}
                    {u.devices.length === 0 && (
                      <span className="text-xs text-overlay0">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.typing?.active ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
                      Active
                    </span>
                  ) : u.typing?.finished ? (
                    <span className="text-xs text-overlay0">Done</span>
                  ) : (
                    <span className="text-xs text-overlay1">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(u.dbUser.id)}
                    disabled={!u.typing}
                    className={`rounded px-2.5 py-1 text-xs font-medium ${
                      u.typing
                        ? "bg-blue text-white hover:bg-blue-700"
                        : "cursor-not-allowed bg-surface0 text-overlay0"
                    }`}
                  >
                    View Stats
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <StatsPanel
          user={merged.find((u) => u.dbUser.id === selected)!}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
