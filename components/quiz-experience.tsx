"use client";

import { FormEvent, useState } from "react";

import type { AnswerInput, CapturePosition, DemographicFields, Question } from "@/lib/quiz";
import { eventSlug } from "@/lib/quiz";

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
  consentMarketing: true,
};

export function QuizExperience({
  questions,
  capturePosition,
}: QuizExperienceProps) {
  const [step, setStep] = useState(capturePosition === "start" ? -1 : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [demographics, setDemographics] =
    useState<DemographicFields>(initialDemographics);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const totalSteps = questions.length + 1;
  const displayStep = capturePosition === "start" ? step + 2 : step + 1;
  const isCaptureStep =
    capturePosition === "start" ? step === -1 : step === questions.length;
  const activeQuestion = step >= 0 && step < questions.length ? questions[step] : null;
  const canAdvance = activeQuestion ? Boolean(answers[activeQuestion.id]) : true;
  const canStartQuiz =
    demographics.firstName.trim() &&
    demographics.lastName.trim() &&
    demographics.email.trim() &&
    demographics.company.trim();

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
    await persistSubmission();
  }

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,209,102,0.28),rgba(119,209,197,0.16),rgba(255,107,107,0.18))] blur-2xl" />
      <div className="relative rounded-[2rem] border border-white/12 bg-[var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">
              Quiz flow
            </p>
            <p className="mt-2 text-lg font-medium text-white">
              {submissionState === "success"
                ? "Submission saved"
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
              <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-100">
                Ready for follow-up
              </div>
              <h2 className="text-3xl font-semibold">Thank you. Your quiz response is in.</h2>
              <p className="text-base leading-7 text-white/72">
                The submission has been written to Neon. You can now tailor the result screen, follow-up email, or on-site sales handoff around this captured profile.
              </p>
              {score !== null ? (
                <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                    Readiness score
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{score}/15</p>
                </div>
              ) : null}
          </div>
        ) : isCaptureStep ? (
          <form
            key="capture"
            onSubmit={capturePosition === "end" ? submitQuiz : undefined}
            className="space-y-5 [animation:fade-in-up_0.35s_ease-out]"
          >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Demographic capture
                </p>
                <h2 className="text-3xl font-semibold">
                  Capture the contact before the energy drops.
                </h2>
                <p className="text-sm leading-7 text-white/68">
                  The current configuration places capture at the {capturePosition}. You can switch that in one constant later if needed.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={demographics.firstName}
                  onChange={(value) => updateDemographicField("firstName", value)}
                  required
                />
                <Field
                  label="Last name"
                  value={demographics.lastName}
                  onChange={(value) => updateDemographicField("lastName", value)}
                  required
                />
                <Field
                  label="Work email"
                  inputType="email"
                  value={demographics.email}
                  onChange={(value) => updateDemographicField("email", value)}
                  required
                />
                <Field
                  label="Company"
                  value={demographics.company}
                  onChange={(value) => updateDemographicField("company", value)}
                  required
                />
                <Field
                  label="Job title"
                  value={demographics.jobTitle}
                  onChange={(value) => updateDemographicField("jobTitle", value)}
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
                  I am happy to receive follow-up communication related to the summit, next steps, and relevant offers.
                </span>
              </label>

              {errorMessage ? (
                <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {capturePosition === "start" ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canStartQuiz}
                    className="rounded-full bg-[linear-gradient(90deg,var(--accent),#ffb703)] px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start the quiz
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submissionState === "submitting"}
                    className="rounded-full bg-[linear-gradient(90deg,var(--accent),#ffb703)] px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submissionState === "submitting" ? "Saving..." : "Submit response"}
                  </button>
                )}
              </div>
          </form>
        ) : (
          <div
            key={activeQuestion?.id}
            className="space-y-6 [animation:fade-in-up_0.35s_ease-out]"
          >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Question {step + 1}
                </p>
                <h2 className="text-3xl font-semibold">{activeQuestion?.prompt}</h2>
              </div>

              <div className="grid gap-3">
                {activeQuestion?.options.map((option) => {
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
                      <span className="block text-base font-medium text-white">
                        {option.label}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-white/66">
                        {option.description}
                      </span>
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

                {step === questions.length - 1 && capturePosition === "start" ? (
                  <button
                    type="button"
                    onClick={() => void persistSubmission()}
                    disabled={!canAdvance || submissionState === "submitting"}
                    className="rounded-full bg-[linear-gradient(90deg,var(--accent-2),#b8f2e6)] px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submissionState === "submitting" ? "Saving..." : "Finish and save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canAdvance}
                    className="rounded-full bg-[linear-gradient(90deg,var(--accent-2),#b8f2e6)] px-6 py-3 font-medium text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {step === questions.length - 1 ? "Continue" : "Next question"}
                  </button>
                )}
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
