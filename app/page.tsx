import Image from "next/image";

import { QuizShell } from "@/components/quiz-shell";
import { capturePosition, eventName, questions } from "@/lib/quiz";

export default function HomePage() {
  return (
    <main className="relative min-h-[100dvh] bg-[var(--bg)] text-white">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/politico-pub-wallpaper.png')",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(34,5,8,0.58),rgba(48,8,12,0.42),rgba(22,4,8,0.62))]" />
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-start px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-4">
        <div className="space-y-4 lg:space-y-3">
          <div className="space-y-2 lg:space-y-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
              <Image
                src="/politico-pub-logo.png"
                alt="POLITICO Pub"
                width={789}
                height={601}
                className="h-auto w-[112px] sm:w-[138px] lg:w-[148px]"
                priority
              />
              <div className="space-y-1.5 lg:space-y-2">
                <h1 className="max-w-xl text-2xl font-semibold leading-[1.02] sm:text-3xl lg:text-[2.8rem]">
                  {eventName}
                </h1>
                <p className="max-w-[48rem] text-sm leading-6 text-white/74 sm:text-base sm:leading-7 lg:text-[0.95rem] lg:leading-6">
                  Test your Westminster instincts with ten questions from the world of POLITICO.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <a
              href="/leaderboard"
              className="rounded-full border border-white/14 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:text-sm"
            >
              Open full-screen leaderboard
            </a>
          </div>
          <QuizShell questions={questions} capturePosition={capturePosition} />
        </div>
      </section>
    </main>
  );
}
