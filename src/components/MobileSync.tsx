"use client";

import { useSocket } from "@/hooks/useSocket";

export default function MobileSync() {
  const { typing, connected } = useSocket("Mobile");

  const active = typing?.active ?? false;
  const finished = typing?.finished ?? false;
  const wpm = typing?.wpm ?? 0;
  const accuracy = typing?.accuracy ?? 100;
  const elapsed = typing?.elapsed ?? 0;
  const progress = typing?.progress ?? 0;

  const elapsedStr =
    elapsed < 60
      ? `${Math.floor(elapsed)}s`
      : `${Math.floor(elapsed / 60)}m ${Math.floor(elapsed % 60)}s`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            connected ? "bg-green" : "bg-red"
          }`}
        />
        {connected ? "Connected" : "Disconnected"}
      </div>

      {!connected ? (
        <p className="text-sm text-subtext0">Waiting for connection...</p>
      ) : !active && !finished ? (
        <div className="text-center">
          <div className="mb-2 h-6 w-6 animate-pulse rounded-full bg-yellow" />
          <p className="text-sm text-overlay0">Waiting for typing to start...</p>
        </div>
      ) : active ? (
        <>
          <div className="flex flex-col items-center gap-1">
            <div className="h-5 w-5 animate-pulse rounded-full bg-green shadow-lg shadow-green/50" />
            <span className="text-xs font-medium text-green">
              TYPING IN PROGRESS
            </span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{wpm}</div>
              <div className="text-xs text-overlay0">WPM</div>
            </div>
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{accuracy}%</div>
              <div className="text-xs text-overlay0">Accuracy</div>
            </div>
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{elapsedStr}</div>
              <div className="text-xs text-overlay0">Elapsed</div>
            </div>
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{progress}%</div>
              <div className="text-xs text-overlay0">Progress</div>
            </div>
          </div>
        </>
      ) : finished ? (
        <>
          <div className="h-5 w-5 rounded-full bg-surface1" />
          <span className="text-xs font-medium text-overlay0">FINISHED</span>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-3xl font-bold tabular-nums text-green">
                {wpm}
              </div>
              <div className="text-xs text-overlay0">Final WPM</div>
            </div>
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-3xl font-bold tabular-nums text-blue">
                {accuracy}%
              </div>
              <div className="text-xs text-overlay0">Accuracy</div>
            </div>
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-xl font-bold tabular-nums">{elapsedStr}</div>
              <div className="text-xs text-overlay0">Duration</div>
            </div>
            <div className="rounded-lg border border-surface1 p-3 text-center">
              <div className="text-xl font-bold tabular-nums">
                {Math.round(wpm * accuracy * 0.01)}
              </div>
              <div className="text-xs text-overlay0">Net WPM</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
