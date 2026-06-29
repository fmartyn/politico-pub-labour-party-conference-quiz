"use client";

import { FormEvent, useState } from "react";

import type { AnswerInput, CapturePosition, DemographicFields, Question } from "@/lib/quiz";
import { eventName, eventSlug, getResultMeta } from "@/lib/quiz";

type QuizExperienceProps = {
  questions: Question[];
  capturePosition: CapturePosition;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

const initialDemographics: DemographicFields = {
  email: "",
  firstName: "",
  lastName: "",
  company: "",
  jobTitle: "",
  enterPrizeDraw: false,
  consentMarketing: true,
};

export function QuizExperience({
  questions,
  capturePosition,
}: QuizExperienceProps) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [demographics, setDemographics] =
    useState<DemographicFields>(initialDemographics);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const totalSteps = questions.length + 2;
  const displayStep = step + 2;
  const isIntroStep = step === -1;
  const isPrizeStep = step === questions.length;
  const activeQuestion = step >= 0 && step < questions.length ? questions[step] : null;
  const canAdvance = activeQuestion ? Boolean(answers[activeQuestion.id]) : true;
  const canStartQuiz =
    demographics.email.trim() &&
    demographics.company.trim() &&
    demographics.jobTitle.trim();
  const canSubmit =
    !demographics.enterPrizeDraw ||
    (demographics.firstName.trim() && demographics.lastName.trim());

  function updateDemographicField<K extends keyof DemographicFields>(
    field: K,
    value: DemographicFields[K],
  ) {
    setDemographics((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAnswer(questionId: string, option: string) {
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

  async function persistSubmission() {
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
        eventSlug,
        quizVersion: "v1",
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      message?: string;
      score?: number;
    };

    if (!response.ok || !result.ok) {
      setSubmissionState("error");
      setErrorMessage(result.message ?? "The submission failed.");
      return;
    }

    setScore(result.score ?? null);
    setSubmissionState("success");
  }

  async function submitQuiz(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!canSubmit) {
      setSubmissionState("error");
      setErrorMessage("Add your first and last name to enter the prize draw.");
      return;
    }

    await persistSubmission();
  }

  const result = score !== null ? getResultMeta(score) : null;

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-[linear-gradient(135deg,rgba(245,177,63,0.26),rgba(217,54,50,0.18),rgba(255,143,120,0.16))] blur-2xl" />
      <div className="relative rounded-[2rem] border border-white/12 bg-[var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">
              Game flow
            </p>
            <p className="mt-2 text-lg font-medium text-white">
              {submissionState === "success"
                ? "Quiz complete"
                : `Step ${Math.min(displayStep, totalSteps)} of ${totalSteps}`}
            </p>
          </div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
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
            className="space-y-5 [animation:fade-in-up_0.35s_ease-out]"
          >
              <div className="inline-flex rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--accent-3)]">
                Score locked
              </div>
              <h2 className="text-3xl font-semibold">{result?.title ?? "Political Pro-Quiz complete"}</h2>
              <p className="text-base leading-7 text-white/72">
                {result?.description ??
                  `Thanks for playing ${eventName}.`}
              </p>
              {score !== null ? (
                <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                    Your score
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{score}/15</p>
                </div>
              ) : null}
              <p className="text-sm leading-7 text-white/60">
                {demographics.enterPrizeDraw
                  ? "Your prize draw entry has been saved."
                  : "You skipped the prize draw, but your quiz score is safely recorded."}
              </p>
          </div>
        ) : isIntroStep ? (
          <form
            key="intro"
            className="space-y-5 [animation:fade-in-up_0.35s_ease-out]"
          >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Step one
                </p>
                <h2 className="text-3xl font-semibold">
                  Start with your work details.
                </h2>
                <p className="text-sm leading-7 text-white/68">
                  Enter your email, organisation, and role to unlock the quiz.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Email"
                  inputType="email"
                  value={demographics.email}
                  onChange={(value) => updateDemographicField("email", value)}
                  required
                />
                <Field
                  label="Organization"
                  value={demographics.company}
                  onChange={(value) => updateDemographicField("company", value)}
                  required
                />
                <Field
                  label="Role"
                  value={demographics.jobTitle}
                  onChange={(value) => updateDemographicField("jobTitle", value)}
                  required
                />
              </div>

              <label className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-white/74">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                  checked={demographics.consentMarketing}
                  onChange={(event) =>
                    updateDemographicField("consentMarketing", event.target.checked)
                  }
                />
                <span>
                  Keep me posted on POLITICO Pro updates and related offers.
                </span>
              </label>

              {errorMessage ? (
                <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canStartQuiz}
                  className="rounded-full bg-[linear-gradient(90deg,var(--accent),#ffcf70)] px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Play now
                </button>
              </div>
          </form>
        ) : isPrizeStep ? (
          <form
            key="prize"
            onSubmit={submitQuiz}
            className="space-y-5 [animation:fade-in-up_0.35s_ease-out]"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Final step
              </p>
              <h2 className="text-3xl font-semibold">
                Want to enter the prize draw?
              </h2>
              <p className="text-sm leading-7 text-white/68">
                Add your first and last name if you want to be included.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-white/74">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                checked={demographics.enterPrizeDraw}
                onChange={(event) =>
                  updateDemographicField("enterPrizeDraw", event.target.checked)
                }
              />
              <span>Yes, enter me into the prize draw.</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            {errorMessage ? (
              <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={previousStep}
                className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white/74 transition hover:bg-white/7"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submissionState === "submitting"}
                className="rounded-full bg-[linear-gradient(90deg,var(--accent),#ffcf70)] px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submissionState === "submitting" ? "Submitting..." : "Finish game"}
              </button>
            </div>
          </form>
        ) : (
          <div
            key={activeQuestion?.id}
            className="space-y-6 [animation:fade-in-up_0.35s_ease-out]"
          >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Quick-fire round
                </p>
                <h2 className="text-3xl font-semibold">{activeQuestion?.prompt}</h2>
              </div>

              <div className="quiz-grid">
                {activeQuestion?.options.map((option, index) => {
                  const selected = answers[activeQuestion.id] === option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleAnswer(activeQuestion.id, option.label)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        selected
                          ? "border-[var(--accent)] bg-white/12"
                          : "border-white/10 bg-white/6 hover:border-white/25 hover:bg-white/9"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-sm font-semibold text-white">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div>
                          <span className="block text-base font-medium text-white">
                            {option.label}
                          </span>
                          <span className="mt-2 block text-sm leading-6 text-white/66">
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

              <div className="flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={step === 0 && capturePosition === "end"}
                  className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white/74 transition hover:bg-white/7 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance}
                  className="rounded-full bg-[linear-gradient(90deg,var(--accent-2),var(--accent-4))] px-6 py-3 font-medium text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.25em] text-white/55">{label}</span>
      <input
        type={inputType}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-[var(--accent)]"
      />
    </label>
  );
}
