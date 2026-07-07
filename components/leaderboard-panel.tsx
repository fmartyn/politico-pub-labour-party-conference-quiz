"use client";

import { useEffect, useState } from "react";

import { formatDuration } from "@/lib/quiz";

type LeaderboardEntry = {
  rank: number;
  name: string;
  company: string;
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
    <aside className="relative rounded-[1.5rem] border border-white/12 bg-[var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5 lg:p-3.5">
      <div className="space-y-1.5 lg:space-y-1">
        <p className="text-xs uppercase tracking-[0.28em] text-white/50">
          Leaderboard
        </p>
        <h2 className="text-xl font-semibold text-white sm:text-2xl lg:text-[1.75rem]">Fastest and most correct</h2>
        <p className="text-xs leading-5 text-white/68 sm:text-sm sm:leading-6 lg:text-xs lg:leading-5">
          Ranked by score first, then completion time.
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/74 sm:text-sm lg:mt-2.5">
        <span className="font-semibold text-white">{totalCompleted}</span> people have completed the quiz
      </div>

      <div className="mt-3 space-y-1.5 lg:mt-2.5 lg:space-y-1.5">
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/68">
            Loading leaderboard...
          </div>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}-${entry.company}-${entry.durationMs}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2"
            >
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/8 text-xs font-semibold text-white">
                {entry.rank}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white lg:text-[0.88rem]">{entry.name}</p>
                <p className="truncate text-[11px] text-white/58">{entry.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white lg:text-[0.88rem]">{entry.score}/15</p>
                <p className="text-[11px] text-white/55">{formatDuration(entry.durationMs)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/68 lg:text-[0.88rem] lg:leading-6">
            No names on the board yet. Complete the quiz and submit your details to take a spot.
          </div>
        )}
      </div>
    </aside>
  );
}
