import Image from "next/image";

import { QuizExperience } from "@/components/quiz-experience";
import { capturePosition, eventName, questions } from "@/lib/quiz";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_18%),radial-gradient(circle_at_78%_10%,_rgba(225,48,45,0.34),_transparent_18%),radial-gradient(circle_at_50%_100%,_rgba(244,176,64,0.18),_transparent_24%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
              Playbook London
            </div>
            <div className="space-y-4">
              <Image
                src="/pro-logo-white.svg"
                alt="POLITICO Pro"
                width={220}
                height={44}
                className="h-auto w-[170px] sm:w-[220px]"
                priority
              />
              <h1 className="max-w-xl text-5xl font-semibold leading-[0.94] md:text-6xl">
                {eventName}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/72">
                Five quick-fire questions. One Westminster-flavoured score. Optional prize draw at the end.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-white/72 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">5</p>
                <p>Political trivia rounds</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">90 sec</p>
                <p>Built for event traffic</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">
                  {capturePosition === "start" ? "Start" : "End"}
                </p>
                <p>Entry details first</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <QuizExperience questions={questions} capturePosition={capturePosition} />
          </div>
        </div>
      </section>
    </main>
  );
}
