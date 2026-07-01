import Image from "next/image";

import { QuizShell } from "@/components/quiz-shell";
import { capturePosition, eventName, questions } from "@/lib/quiz";

export default function HomePage() {
  return (
    <main className="relative min-h-[100dvh] bg-[var(--bg)] text-white">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://www.politico.eu/wp-content/uploads/2026/05/20/1920x1080-9-1-2-scaled.png')",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(8,10,16,0.84),rgba(16,19,26,0.72),rgba(24,29,40,0.82))]" />
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-start px-4 py-4 sm:px-5 sm:py-5 lg:px-10 lg:py-8">
        <div className="space-y-4 lg:space-y-6">
          <div className="space-y-2">
            <div className="space-y-3">
              <Image
                src="/pro-logo-white.svg"
                alt="POLITICO Pro"
                width={220}
                height={44}
                className="h-auto w-[138px] sm:w-[170px] lg:w-[220px]"
                priority
              />
              <h1 className="max-w-xl text-3xl font-semibold leading-[0.96] sm:text-4xl lg:text-6xl">
                {eventName}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
                Test your Westminster instincts with five questions inspired by the world of POLITICO Pro.
              </p>
              <p className="hidden max-w-lg text-sm leading-7 text-white/62 lg:block">
                Finish the quiz, get your score by email, and choose whether to enter the prize draw.
              </p>
            </div>
          </div>
          <QuizShell questions={questions} capturePosition={capturePosition} />
        </div>
      </section>
    </main>
  );
}
