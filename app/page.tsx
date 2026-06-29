import { QuizExperience } from "@/components/quiz-experience";
import { capturePosition, eventName, questions } from "@/lib/quiz";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_20%),radial-gradient(circle_at_80%_12%,_rgba(225,48,45,0.28),_transparent_20%),radial-gradient(circle_at_50%_100%,_rgba(244,176,64,0.16),_transparent_24%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
              POLITICO Pro Reader Survey
            </div>
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">
                {eventName}
              </p>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[0.92] md:text-6xl">
                A five-question check-in on how you read, follow, and value policy coverage.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/72">
                Take the survey, share what kind of reporting keeps your attention, and you may be selected for a POLITICO Pro trial or other follow-up perks.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-white/72 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">5</p>
                <p>Reader-focused questions</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">1 min</p>
                <p>Fast to complete</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">
                  {capturePosition === "start" ? "Early" : "Final"}
                </p>
                <p>Optional details step</p>
              </div>
            </div>
          </div>

          <QuizExperience questions={questions} capturePosition={capturePosition} />
        </div>
      </section>
    </main>
  );
}
