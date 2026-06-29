import { QuizExperience } from "@/components/quiz-experience";
import { capturePosition, eventName, questions } from "@/lib/quiz";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_22%),radial-gradient(circle_at_85%_10%,_rgba(119,209,197,0.28),_transparent_20%),radial-gradient(circle_at_50%_100%,_rgba(247,166,0,0.18),_transparent_28%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
              Summit activation stack
            </div>
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">
                {eventName}
              </p>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[0.92] md:text-6xl">
                A lead-capture quiz built for conversion, not just completion.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/72">
                This starter is wired for a five-question summit quiz, animated front end, Vercel deployment, and Neon persistence.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-white/72 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">5</p>
                <p>Strategic quiz questions</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">1</p>
                <p>Neon-backed submission table</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">
                  {capturePosition === "start" ? "Start" : "End"}
                </p>
                <p>Demographic capture placement</p>
              </div>
            </div>
          </div>

          <QuizExperience questions={questions} capturePosition={capturePosition} />
        </div>
      </section>
    </main>
  );
}
