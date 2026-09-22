"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { eventName, formatDuration } from "@/lib/quiz";

type LeaderboardEntry = {
  rank: number;
  name: string;
  company: string;
  score: number;
  durationMs: number;
};

export function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
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
          setLastUpdated(new Date());
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLeaderboard();
    const interval = window.setInterval(() => void loadLeaderboard(), 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--bg)] text-white">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/politico-pub-wallpaper.png')" }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(34,5,8,0.62),rgba(48,8,12,0.46),rgba(22,4,8,0.7))]" />

      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1500px] flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/15 pb-6 sm:pb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src="/politico-pub-logo.png"
              alt="POLITICO Pub"
              width={789}
              height={601}
              className="h-auto w-[92px] sm:w-[126px] lg:w-[150px]"
              priority
            />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/55 sm:text-sm">
                Live leaderboard
              </p>
              <h1 className="mt-1 max-w-3xl text-2xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {eventName}
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            Open quiz
          </Link>
        </header>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-center lg:gap-12 lg:py-12">
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
              <div>
                <h2 className="text-3xl font-semibold sm:text-5xl">Fastest and most correct</h2>
                <p className="mt-2 text-sm text-white/68 sm:text-base">
                  Ranked by score first, then completion time.
                </p>
              </div>
              <div className="text-right text-sm text-white/65 sm:text-base">
                <p><span className="font-semibold text-white">{totalCompleted}</span> completed</p>
                <p className="mt-1 text-xs text-white/45">
                  {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Updating..."}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="rounded-3xl border border-white/10 bg-white/7 p-6 text-white/70">
                  Loading leaderboard...
                </div>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}-${entry.company}-${entry.durationMs}`}
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl border px-4 py-4 sm:px-6 sm:py-5 ${
                      entry.rank === 1
                        ? "border-[var(--accent)]/50 bg-[var(--accent)]/15"
                        : "border-white/10 bg-white/7"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-semibold sm:h-12 sm:w-12">
                      {entry.rank}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold sm:text-2xl">{entry.name}</p>
                      <p className="truncate text-sm text-white/58 sm:text-base">{entry.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold sm:text-2xl">{entry.score}/30</p>
                      <p className="text-xs text-white/55 sm:text-sm">{formatDuration(entry.durationMs)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/7 p-6 text-white/70">
                  No names on the board yet. Complete the quiz and submit your details to take a spot.
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/15 bg-white/95 p-5 text-center shadow-[var(--shadow)] sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6f1b1e]">Play the quiz</p>
            <Image
              src="/party-conference-quiz-2026.png"
              alt="QR code for the Politico Pub Quiz"
              width={420}
              height={420}
              className="mx-auto mt-4 h-auto w-full max-w-[290px] rounded-2xl"
              priority
            />
            <p className="mt-4 text-sm font-medium text-[#3c1114] sm:text-base">
              Scan to enter the quiz and join the leaderboard.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
