"use client";

import { FormEvent, useRef, useState } from "react";

import type { AnswerInput, CapturePosition, DemographicFields, Question } from "@/lib/quiz";
import { eventName, eventSlug, formatDuration, getResultMeta } from "@/lib/quiz";

type QuizExperienceProps = {
  questions: Question[];
  capturePosition: CapturePosition;
  onSubmissionSaved?: () => void;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [demographics, setDemographics] =
    useState<DemographicFields>(initialDemographics);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const totalSteps = questions.length + 1;
  const displayStep = step + 1;
  const isPrizeStep = step === questions.length;
  const activeQuestion = step >= 0 && step < questions.length ? questions[step] : null;
  const canAdvance = activeQuestion ? Boolean(answers[activeQuestion.id]) : true;
  const canSubmit =
    !demographics.enterPrizeDraw ||
    (Boolean(demographics.firstName.trim()) &&
      Boolean(demographics.lastName.trim()) &&
      Boolean(demographics.email.trim()) &&
      Boolean(demographics.company.trim()) &&
      Boolean(demographics.jobTitle.trim()) &&
      demographics.privacyPolicyAccepted);

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

    setStep((current) => current + 1);
  }

  function previousStep() {
    setStep((current) => current - 1);
  }

  async function persistSubmission(finalDurationMs: number) {
    setSubmissionState("submitting");
    setErrorMessage("");

    const answerPayload: AnswerInput[] = questions.map((question) => ({
      questionId: question.id,
      prompt: question.prompt,
      value: answers[question.id] ?? "",
      weight:
        question.options.find((option) => option.label === answers[question.id])?.weight ?? 0,
    }));

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
  const statusLabel = submissionState === "success"
    ? "Complete"
    : isPrizeStep
      ? "Tell us about you"
      : `Question ${step + 1} of ${questions.length}`;

  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(245,177,63,0.2),rgba(217,54,50,0.16),rgba(255,143,120,0.12))] blur-xl sm:-inset-4 sm:rounded-[2rem] sm:blur-2xl" />
      <div className="relative rounded-[1.5rem] border border-white/12 bg-[var(--panel)] p-4 shadow-[var(--shadow)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
          <p className="text-sm font-medium text-white sm:text-lg">{statusLabel}</p>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:h-2 sm:w-28">
            <div
              style={{
                width: `${submissionState === "success" ? 100 : (Math.min(displayStep, totalSteps) / totalSteps) * 100}%`,
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
              <p className="text-sm leading-6 text-white/60 sm:leading-7">
                {demographics.enterPrizeDraw
                  ? "Your prize draw entry has been saved."
                  : "You skipped the prize draw, but your quiz score is safely recorded."}
              </p>
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
                Your score is ready. If you want to be entered into the draw and hear more from POLITICO Pro, add your details below.
              </p>
            </div>

            {score !== null ? (
              <div className="rounded-2xl border border-white/10 bg-white/6 p-3 sm:rounded-3xl sm:p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50 sm:text-sm">
                  Your score
                </p>
                <p className="mt-1 text-3xl font-semibold text-white sm:mt-2 sm:text-4xl">{score}/15</p>
                {durationMs > 0 ? (
                  <p className="mt-2 text-xs leading-5 text-white/66 sm:text-sm sm:leading-6">
                    Time to complete: {formatDuration(durationMs)}
                  </p>
                ) : null}
                <p className="mt-2 text-xs leading-5 text-white/66 sm:mt-3 sm:text-sm sm:leading-6">
                  {result?.title}. {result?.description}
                </p>
              </div>
            ) : null}

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
            className="space-y-4 [animation:fade-in-up_0.35s_ease-out] sm:space-y-6"
          >
              <h2 className="text-[1.35rem] font-semibold leading-[1.15] sm:text-3xl">
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
                      className={`rounded-2xl border p-3 text-left transition sm:rounded-3xl sm:p-4 ${
                        selected
                          ? "border-[var(--accent)] bg-white/12"
                          : "border-white/10 bg-white/6 hover:border-white/25 hover:bg-white/9"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div>
                          <span className="block text-sm font-medium text-white sm:text-base">
                            {option.label}
                          </span>
                          <span className="mt-1.5 block text-xs leading-5 text-white/66 sm:mt-2 sm:text-sm sm:leading-6">
                            {option.description}
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

              <div className="flex flex-wrap justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={step === 0 && capturePosition === "end"}
                  className="rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white/74 transition hover:bg-white/7 disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:py-3"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance}
                  className="rounded-full bg-[linear-gradient(90deg,var(--accent-2),var(--accent-4))] px-5 py-2.5 font-medium text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3"
                >
                  {step === questions.length - 1 ? "Prize draw" : "Next question"}
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
