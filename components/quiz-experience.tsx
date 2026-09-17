"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

import type { AnswerInput, CapturePosition, DemographicFields, Question } from "@/lib/quiz";
import {
  eventName,
  eventSlug,
  formatDuration,
  getResultMeta,
  scoreAnswers,
} from "@/lib/quiz";

type QuizExperienceProps = {
  questions: Question[];
  capturePosition: CapturePosition;
  onSubmissionSaved?: () => void;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";
type AnswerRevealState = {
  questionId: string;
  selectedLabel: string;
  correctLabel: string;
  isCorrect: boolean;
};

const initialDemographics: DemographicFields = {
  email: "",
  firstName: "",
  lastName: "",
  company: "",
  jobTitle: "",
  enterPrizeDraw: false,
  privacyPolicyAccepted: false,
  consentMarketing: false,
};

export function QuizExperience({
  questions,
  capturePosition,
  onSubmissionSaved,
}: QuizExperienceProps) {
  const shareUrl = typeof window === "undefined" ? "" : window.location.origin;
  const shareText = `Try the ${eventName} and see where you land on the leaderboard.`;
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [demographics, setDemographics] =
    useState<DemographicFields>(initialDemographics);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const [answerReveal, setAnswerReveal] = useState<AnswerRevealState | null>(null);

  const totalSteps = questions.length + 1;
  const displayStep = step < 0 ? 0 : step + 1;
  const isIntroStep = step === -1;
  const isPrizeStep = step === questions.length;
  const activeQuestion = step >= 0 && step < questions.length ? questions[step] : null;
  const isRevealingAnswer = answerReveal?.questionId === activeQuestion?.id;
  const revealedSelectedLabel = isRevealingAnswer ? answerReveal?.selectedLabel ?? null : null;
  const revealedCorrectLabel = isRevealingAnswer ? answerReveal?.correctLabel ?? null : null;
  const revealedAnswerIsCorrect = isRevealingAnswer ? answerReveal?.isCorrect ?? false : false;
  const canAdvance = activeQuestion ? Boolean(answers[activeQuestion.id]) : true;
  const answerPayload: AnswerInput[] = questions.map((question) => ({
    questionId: question.id,
    prompt: question.prompt,
    value: answers[question.id] ?? "",
    weight: question.options.find((option) => option.label === answers[question.id])?.weight ?? 0,
  }));
  const liveScore = score ?? scoreAnswers(answerPayload);
  const canSubmit =
    !demographics.enterPrizeDraw ||
    (Boolean(demographics.firstName.trim()) &&
      Boolean(demographics.lastName.trim()) &&
      Boolean(demographics.email.trim()) &&
      Boolean(demographics.company.trim()) &&
      Boolean(demographics.jobTitle.trim()) &&
      demographics.privacyPolicyAccepted);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  function updateDemographicField<K extends keyof DemographicFields>(
    field: K,
    value: DemographicFields[K],
  ) {
    setDemographics((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAnswer(questionId: string, option: string, startedAtMs: number) {
    if (startedAtRef.current === null) {
      startedAtRef.current = startedAtMs;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  }

  function nextStep() {
    if (activeQuestion && !answers[activeQuestion.id]) {
      return;
    }

    if (activeQuestion) {
      const selectedLabel = answers[activeQuestion.id];
      const correctLabel =
        activeQuestion.options.find((option) => option.weight > 0)?.label ?? "";
      const isCorrect = selectedLabel === correctLabel;

      setAnswerReveal({
        questionId: activeQuestion.id,
        selectedLabel,
        correctLabel,
        isCorrect,
      });

      revealTimeoutRef.current = window.setTimeout(() => {
        setAnswerReveal(null);
        setStep((current) => current + 1);
      }, 700);

      return;
    }

    setStep((current) => current + 1);
  }

  function previousStep() {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    setAnswerReveal(null);
    setStep((current) => current - 1);
  }

  async function shareQuiz() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // Ignore cancelled share actions.
      }
    }
  }

  async function persistSubmission(finalDurationMs: number) {
    setSubmissionState("submitting");
    setErrorMessage("");

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...demographics,
        answers: answerPayload,
        capturePosition,
        durationMs: finalDurationMs,
        eventSlug,
        quizVersion: "v1",
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      message?: string;
      score?: number;
      durationMs?: number;
    };

    if (!response.ok || !result.ok) {
      setSubmissionState("error");
      setErrorMessage(result.message ?? "The submission failed.");
      return;
    }

    setScore(result.score ?? null);
    setDurationMs(result.durationMs ?? finalDurationMs);
    setSubmissionState("success");
    onSubmissionSaved?.();
  }

  async function submitQuiz(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!canSubmit) {
      if (demographics.enterPrizeDraw && !demographics.privacyPolicyAccepted) {
        setSubmissionState("error");
        setErrorMessage("Accept the privacy policy before submitting.");
        return;
      }

      setSubmissionState("error");
      setErrorMessage("Add your details to enter the prize draw.");
      return;
    }

    const startedAt = startedAtRef.current ?? performance.now();
    const finalDurationMs = Math.round(performance.now() - startedAt);
    setDurationMs(finalDurationMs);
    await persistSubmission(finalDurationMs);
  }

  const result = score !== null ? getResultMeta(score) : null;
  const statusLabel =
    submissionState === "success"
      ? "Complete"
      : isIntroStep
        ? "Start"
        : isPrizeStep
          ? "Tell us about you"
          : `Question ${step + 1} of ${questions.length}`;
  const progressPercent =
    submissionState === "success"
      ? 100
      : isIntroStep
        ? 0
        : (Math.min(displayStep, totalSteps) / totalSteps) * 100;

  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(245,177,63,0.2),rgba(217,54,50,0.16),rgba(255,143,120,0.12))] blur-xl sm:-inset-4 sm:rounded-[2rem] sm:blur-2xl" />
      <div className="relative rounded-[1.5rem] border border-white/12 bg-[var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6 lg:p-4">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4 lg:mb-3">
          <p className="text-sm font-medium text-white sm:text-lg lg:text-base">{statusLabel}</p>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:h-2 sm:w-28">
            <div
              style={{
                width: `${progressPercent}%`,
              }}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
            />
          </div>
        </div>

        {submissionState === "success" ? (
          <div
            key="success"
            className="space-y-4 [animation:fade-in-up_0.35s_ease-out] sm:space-y-5"
          >
              <div className="inline-flex rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--accent-3)]">
                Score locked
              </div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{result?.title ?? "Political Pro-Quiz complete"}</h2>
              <p className="text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
                {result?.description ??
                  `Thanks for playing ${eventName}.`}
              </p>
              {score !== null ? (
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 sm:rounded-3xl sm:p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                    Your score
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{score}/15</p>
                  {durationMs > 0 ? (
                    <p className="mt-2 text-sm text-white/66">
                      Finished in {formatDuration(durationMs)}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50 sm:text-sm">
                  Answer review
                </p>
                <div className="space-y-2">
                  {questions.map((question, index) => {
                    const selectedLabel = answers[question.id] ?? "No answer";
                    const correctLabel =
                      question.options.find((option) => option.weight > 0)?.label ?? "Unknown";
                    const isCorrect = selectedLabel === correctLabel;

                    return (
                      <div
                        key={question.id}
                        className="rounded-2xl border border-white/10 bg-white/6 p-3 sm:rounded-3xl sm:p-4"
                      >
                        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/45 sm:text-xs">
                          Question {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-white sm:text-base">
                          {question.prompt}
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div
                            className={`rounded-xl border px-3 py-2 text-xs sm:text-sm ${
                              isCorrect
                                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                                : "border-red-400/30 bg-red-500/10 text-red-100"
                            }`}
                          >
                            <span className="block text-[0.65rem] uppercase tracking-[0.2em] opacity-70 sm:text-[0.7rem]">
                              Your answer
                            </span>
                            <span className="mt-1 block font-medium">{selectedLabel}</span>
                          </div>
                          <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100 sm:text-sm">
                            <span className="block text-[0.65rem] uppercase tracking-[0.2em] opacity-70 sm:text-[0.7rem]">
                              Correct answer
                            </span>
                            <span className="mt-1 block font-medium">{correctLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-sm leading-6 text-white/60 sm:leading-7">
                {demographics.enterPrizeDraw
                  ? "Your prize draw entry has been saved."
                  : "You skipped the prize draw, but your quiz score is safely recorded."}
              </p>
          </div>
        ) : isIntroStep ? (
          <div
            key="intro"
            className="grid gap-4 [animation:fade-in-up_0.35s_ease-out] lg:grid-cols-[1.15fr_0.72fr] lg:items-center"
          >
            <div className="space-y-3 lg:space-y-2">
              <div className="inline-flex rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--accent-3)]">
                Politico Pub challenge
              </div>
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-[1.75rem]">
                Put your Westminster knowledge to the test and secure bragging rights at the Politico Pub.
              </h2>
              <p className="text-sm leading-6 text-white/72 sm:text-base sm:leading-7 lg:text-[0.9rem] lg:leading-5">
                <span className="hidden lg:inline">
                  Scan the QR code to share the quiz, then hit start and see where you land on the board.
                </span>
                <span className="lg:hidden">
                  Share the quiz with friends or rivals, then hit start and see where you land on the board.
                </span>
              </p>
              <div className="flex flex-wrap gap-2.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => void shareQuiz()}
                  className="rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/7"
                >
                  Share
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/7"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(eventName)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
                  className="rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/7"
                >
                  Email
                </a>
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="rounded-full bg-[linear-gradient(90deg,var(--accent),#ffcf70)] px-5 py-2.5 font-medium text-slate-900 transition hover:scale-[1.01] sm:px-6 sm:py-3 lg:px-5 lg:py-2.5"
              >
                Start the quiz
              </button>
            </div>
            <div className="mx-auto hidden w-full max-w-[200px] rounded-[1.5rem] border border-white/12 bg-white p-3 shadow-[var(--shadow)] lg:block lg:max-w-[160px] lg:p-2.5">
              <Image
                src="/playbook-live-quiz-qr.jpeg"
                alt="QR code for the Political Pro-Quiz"
                width={420}
                height={420}
                className="h-auto w-full rounded-xl"
                priority
              />
            </div>
          </div>
        ) : isPrizeStep ? (
          <form
            key="prize"
            onSubmit={submitQuiz}
            className="space-y-3 [animation:fade-in-up_0.35s_ease-out] sm:space-y-4"
          >
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
                Want to enter the prize draw?
              </h2>
              <p className="text-xs leading-5 text-white/68 sm:text-sm sm:leading-6">
                Your score is ready below. If you want to be entered into the draw and hear more from POLITICO Pro, add your details below.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 p-3 sm:rounded-3xl sm:p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50 sm:text-sm">
                    Your score
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white sm:mt-2 sm:text-4xl">
                    {liveScore}/15
                  </p>
                </div>
                {durationMs > 0 ? (
                  <p className="text-right text-xs leading-5 text-white/66 sm:text-sm sm:leading-6">
                    Time to complete: {formatDuration(durationMs)}
                  </p>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/66 sm:mt-3 sm:text-sm sm:leading-6">
                {getResultMeta(liveScore).title}. {getResultMeta(liveScore).description}
              </p>
            </div>

            <label className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/6 p-2.5 text-xs leading-5 text-white/74 sm:gap-3 sm:p-3 sm:text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                checked={demographics.enterPrizeDraw}
                onChange={(event) =>
                  setDemographics((current) => ({
                    ...current,
                    enterPrizeDraw: event.target.checked,
                    consentMarketing: event.target.checked,
                  }))
                }
              />
              <span>
                Yes, enter me into the prize draw and keep me posted on POLITICO Pro updates and related offers.
              </span>
            </label>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              <Field
                label="First name"
                value={demographics.firstName}
                onChange={(value) => updateDemographicField("firstName", value)}
                required={demographics.enterPrizeDraw}
              />
              <Field
                label="Last name"
                value={demographics.lastName}
                onChange={(value) => updateDemographicField("lastName", value)}
                required={demographics.enterPrizeDraw}
              />
              <Field
                label="Email"
                inputType="email"
                value={demographics.email}
                onChange={(value) => updateDemographicField("email", value)}
                required={demographics.enterPrizeDraw}
              />
              <Field
                label="Organization"
                value={demographics.company}
                onChange={(value) => updateDemographicField("company", value)}
                required={demographics.enterPrizeDraw}
              />
              <Field
                label="Role"
                value={demographics.jobTitle}
                onChange={(value) => updateDemographicField("jobTitle", value)}
                required={demographics.enterPrizeDraw}
              />
            </div>

            <label className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/6 p-2.5 text-xs leading-5 text-white/74 sm:gap-3 sm:p-3 sm:text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                checked={demographics.privacyPolicyAccepted}
                onChange={(event) =>
                  updateDemographicField("privacyPolicyAccepted", event.target.checked)
                }
              />
              <span>
                I have read and accept the{" "}
                <a
                  href="https://www.politico.eu/privacy-policy/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#ffd56a] underline decoration-2 underline-offset-4"
                >
                  privacy policy
                </a>
                .
              </span>
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={previousStep}
                className="rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white/74 transition hover:bg-white/7 sm:px-5 sm:py-3"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submissionState === "submitting"}
                className="rounded-full bg-[linear-gradient(90deg,var(--accent),#ffcf70)] px-5 py-2.5 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3"
              >
                {submissionState === "submitting"
                  ? "Submitting..."
                  : demographics.enterPrizeDraw
                    ? "Save my entry"
                    : "Finish"}
              </button>
            </div>
          </form>
        ) : (
          <div
            key={activeQuestion?.id}
            className="space-y-4 [animation:fade-in-up_0.35s_ease-out] sm:space-y-6 lg:space-y-4"
          >
              <h2 className="text-[1.35rem] font-semibold leading-[1.15] sm:text-3xl lg:text-[1.7rem] lg:leading-[1.08]">
                {activeQuestion?.prompt}
              </h2>

              <div className="quiz-grid">
                {activeQuestion?.options.map((option, index) => {
                  const selected = answers[activeQuestion.id] === option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={(event) =>
                        handleAnswer(activeQuestion.id, option.label, event.timeStamp)
                      }
                      disabled={isRevealingAnswer}
                      className={`rounded-2xl border p-3 text-left transition sm:rounded-3xl sm:p-4 lg:rounded-[1.4rem] lg:p-2.5 ${
                        isRevealingAnswer
                          ? revealedSelectedLabel === option.label
                            ? revealedAnswerIsCorrect
                              ? "border-emerald-400/45 bg-emerald-500/12"
                              : "border-red-400/45 bg-red-500/12"
                            : revealedCorrectLabel === option.label && !revealedAnswerIsCorrect
                              ? "border-emerald-400/35 bg-emerald-500/10"
                              : "border-white/10 bg-white/6 opacity-70"
                          : selected
                            ? "border-[var(--accent)] bg-white/12"
                            : "border-white/10 bg-white/6 hover:border-white/25 hover:bg-white/9"
                      }`}
                    >
                      <div className="flex items-start gap-3 lg:gap-2.5">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm lg:h-7 lg:w-7 lg:text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div>
                          <span className="block text-sm font-medium text-white sm:text-base lg:text-[0.98rem]">
                            {option.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {errorMessage ? (
                <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-3 pt-1 lg:pt-0">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={step === 0 && capturePosition === "end" || isRevealingAnswer}
                  className="rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white/74 transition hover:bg-white/7 disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:py-3 lg:px-4 lg:py-2"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance || isRevealingAnswer}
                  className="rounded-full bg-[linear-gradient(90deg,var(--accent-2),var(--accent-4))] px-5 py-2.5 font-medium text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3 lg:px-5 lg:py-2"
                >
                  {isRevealingAnswer
                    ? revealedAnswerIsCorrect
                      ? "Correct"
                      : "Not quite"
                    : step === questions.length - 1
                      ? "Prize draw"
                      : "Next question"}
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputType?: "text" | "email";
};

function Field({
  label,
  value,
  onChange,
  required = false,
  inputType = "text",
}: FieldProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55 sm:text-xs">
        {label}
      </span>
      <input
        type={inputType}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/7 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[var(--accent)] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
      />
    </label>
  );
}
