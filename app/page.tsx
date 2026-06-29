import Image from "next/image";

import { QuizExperience } from "@/components/quiz-experience";
import { eventName, questions } from "@/lib/quiz";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg)] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://www.politico.eu/wp-content/uploads/2026/05/20/1920x1080-9-1-2-scaled.png')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(8,10,16,0.84),rgba(16,19,26,0.72),rgba(24,29,40,0.82))]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="order-2 space-y-6 lg:order-1">
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
                Test your Westminster instincts with five questions inspired by the world of POLITICO Pro.
              </p>
              <p className="max-w-lg text-sm leading-7 text-white/62">
                Finish the quiz, get your score by email, and choose whether to enter the prize draw.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <QuizExperience questions={questions} capturePosition="end" />
          </div>
        </div>
      </section>
    </main>
  );
}
