import { z } from "zod";

export const eventName = "London Playbook Summit";
export const eventSlug = "london-playbook-summit";
export type CapturePosition = "start" | "end";

export const capturePosition: CapturePosition = "start";

export type Question = {
  id: string;
  prompt: string;
  options: Array<{
    label: string;
    description: string;
    weight: number;
  }>;
};

export const questions: Question[] = [
  {
    id: "growth_priority",
    prompt: "What is the commercial outcome you most want from your playbook this quarter?",
    options: [
      {
        label: "Faster pipeline creation",
        description: "You need more qualified opportunities at the top of the funnel.",
        weight: 3,
      },
      {
        label: "Higher conversion rates",
        description: "You have demand, but sales execution is leaking value.",
        weight: 2,
      },
      {
        label: "Sharper account expansion",
        description: "You are focused on deeper penetration inside existing customers.",
        weight: 1,
      },
    ],
  },
  {
    id: "team_maturity",
    prompt: "How mature is your current go-to-market operating model?",
    options: [
      {
        label: "Highly structured and measured",
        description: "Roles, rituals, and dashboards are already consistent.",
        weight: 3,
      },
      {
        label: "Partially defined",
        description: "Good instincts are present, but the process still varies by person.",
        weight: 2,
      },
      {
        label: "Mostly ad hoc",
        description: "Execution depends on heroic effort instead of repeatable systems.",
        weight: 1,
      },
    ],
  },
  {
    id: "data_confidence",
    prompt: "How much confidence do you have in the data behind your current decisions?",
    options: [
      {
        label: "Very high confidence",
        description: "The team trusts the numbers and acts on them quickly.",
        weight: 3,
      },
      {
        label: "Mixed confidence",
        description: "The data is useful, but definitions or freshness are inconsistent.",
        weight: 2,
      },
      {
        label: "Low confidence",
        description: "Too many decisions are made on partial visibility.",
        weight: 1,
      },
    ],
  },
  {
    id: "ai_readiness",
    prompt: "Where does AI have the clearest role in your revenue motion today?",
    options: [
      {
        label: "Personalized outreach at scale",
        description: "You want sharper messaging without increasing headcount linearly.",
        weight: 3,
      },
      {
        label: "Insight generation for teams",
        description: "You need better visibility into what is working and why.",
        weight: 2,
      },
      {
        label: "Still exploring the practical use cases",
        description: "You are evaluating where AI can create real commercial leverage.",
        weight: 1,
      },
    ],
  },
  {
    id: "summit_follow_up",
    prompt: "What kind of follow-up would be most useful after the summit?",
    options: [
      {
        label: "A tailored strategy session",
        description: "Best for teams wanting a practical next-step roadmap.",
        weight: 3,
      },
      {
        label: "A benchmark and diagnostics pack",
        description: "Best for comparing current performance against best practice.",
        weight: 2,
      },
      {
        label: "Curated resources and examples",
        description: "Best for early-stage exploration after the event.",
        weight: 1,
      },
    ],
  },
];

export const answerSchema = z.object({
  questionId: z.string().min(1),
  prompt: z.string().min(1),
  value: z.string().min(1),
  weight: z.number().int().min(0).max(3),
});

export const submissionSchema = z.object({
  eventSlug: z.string().min(1),
  quizVersion: z.string().min(1),
  capturePosition: z.enum(["start", "end"]),
  email: z.string().email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  company: z.string().trim().min(1),
  jobTitle: z.string().trim().optional().default(""),
  consentMarketing: z.boolean(),
  answers: z.array(answerSchema).length(5),
});

export type AnswerInput = z.infer<typeof answerSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type DemographicFields = Pick<
  SubmissionInput,
  "email" | "firstName" | "lastName" | "company" | "jobTitle" | "consentMarketing"
>;

export function scoreAnswers(answers: AnswerInput[]) {
  return answers.reduce((total, answer) => total + answer.weight, 0);
}
