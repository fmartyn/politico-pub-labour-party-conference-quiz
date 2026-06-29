import { z } from "zod";

export const eventName = "Are You a POLITICO Pro?";
export const eventSlug = "politico-pro-content-survey";
export type CapturePosition = "start" | "end";

export const capturePosition: CapturePosition = "end";

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
    id: "news_start",
    prompt: "When you open your inbox in the morning, what kind of coverage are you most likely to click first?",
    options: [
      {
        label: "A sharp policy briefing",
        description: "You want the core developments fast, with enough context to act on them.",
        weight: 3,
      },
      {
        label: "A smartly curated newsletter",
        description: "You like a strong point of view and a quick read on what matters.",
        weight: 2,
      },
      {
        label: "A headline scan",
        description: "You want the broad picture before deciding what deserves deeper attention.",
        weight: 1,
      },
    ],
  },
  {
    id: "policy_depth",
    prompt: "How deep do you usually want a story to go once a policy issue catches your attention?",
    options: [
      {
        label: "Show me the implications, stakeholders, and next moves",
        description: "You care about what changes, who matters, and what happens next.",
        weight: 3,
      },
      {
        label: "Give me the essential context and the big takeaway",
        description: "You want enough depth to stay informed without reading a full dossier.",
        weight: 2,
      },
      {
        label: "Keep it light unless it becomes a major story",
        description: "You follow policy, but only a few developments merit serious time.",
        weight: 1,
      },
    ],
  },
  {
    id: "topic_interest",
    prompt: "Which area would you most want more premium reporting on right now?",
    options: [
      {
        label: "Tech, AI, and digital policy",
        description: "You are tracking regulation, competition, and where policy meets innovation.",
        weight: 3,
      },
      {
        label: "Energy, climate, and infrastructure",
        description: "You want sharper reporting on the forces shaping the transition.",
        weight: 2,
      },
      {
        label: "Congress, campaigns, and political power",
        description: "You follow the political machinery behind the public headlines.",
        weight: 1,
      },
    ],
  },
  {
    id: "reading_style",
    prompt: "What makes a piece of coverage feel especially valuable to you?",
    options: [
      {
        label: "Exclusive reporting I cannot get elsewhere",
        description: "Originality matters most. You want insight with a reason to pay attention.",
        weight: 3,
      },
      {
        label: "Analysis that connects the dots clearly",
        description: "You value synthesis and explanation more than volume.",
        weight: 2,
      },
      {
        label: "Speed and convenience",
        description: "If it gets you the key takeaway quickly, it has done its job.",
        weight: 1,
      },
    ],
  },
  {
    id: "trial_interest",
    prompt: "If you were offered a chance to explore POLITICO Pro further, what would be most appealing?",
    options: [
      {
        label: "A free trial to explore the reporting firsthand",
        description: "You want to see how the full experience fits into your regular reading habits.",
        weight: 3,
      },
      {
        label: "A curated sample built around my interests",
        description: "You would rather start with a tailored taste than a blank slate.",
        weight: 2,
      },
      {
        label: "Just keep me posted on standout coverage",
        description: "You are interested, but prefer a lighter-touch relationship for now.",
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
