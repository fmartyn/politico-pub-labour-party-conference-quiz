"use client";

import { useEffect, useState } from "react";

import { formatDuration } from "@/lib/quiz";

type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  durationMs: number;
};

type LeaderboardPanelProps = {
  refreshKey: number;
};

export function LeaderboardPanel({ refreshKey }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/leaderboard", { cache: "no-store" });
        const result = (await response.json()) as {
          ok: boolean;
          totalCompleted?: number;
          entries?: LeaderboardEntry[];
        };

        if (!cancelled && response.ok && result.ok) {
          setEntries(result.entries ?? []);
          setTotalCompleted(result.totalCompleted ?? 0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <aside className="relative rounded-[1.5rem] border border-white/12 bg-[var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/50">
          Leaderboard
        </p>
        <h2 className="text-2xl font-semibold text-white">Fastest and most correct</h2>
        <p className="text-sm leading-6 text-white/68">
          Ranked by score first, then completion time.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/74">
        <span className="font-semibold text-white">{totalCompleted}</span> people have completed the quiz
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-5 text-sm text-white/68">
            Loading leaderboard...
          </div>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}-${entry.durationMs}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white">
                {entry.rank}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{entry.name}</p>
                <p className="text-xs text-white/55">{formatDuration(entry.durationMs)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{entry.score}/15</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-5 text-sm text-white/68">
            No names on the board yet. Complete the quiz and submit your details to take a spot.
          </div>
        )}
      </div>
    </aside>
  );
}
