import { z } from "zod";

export const eventName = "Political Pro-Quiz";
export const eventSlug = "political-pro-quiz-playbook";
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
    id: "tech_ai_copyright",
    prompt: "Which British director has been raking the government over the coals on AI and copyright?",
    options: [
      {
        label: "Ken Loach",
        description: "A heavyweight director, but not the one leading this particular fight.",
        weight: 0,
      },
      {
        label: "Danny Boyle",
        description: "A recognisable name, but not the director at the centre of this copyright debate.",
        weight: 0,
      },
      {
        label: "Beeban Kidron",
        description: "She has been one of the clearest voices challenging the government's approach.",
        weight: 3,
      },
    ],
  },
  {
    id: "fs_red_squirrel",
    prompt: "The Investment Association-led and Rachel Reeves-backed campaign to get Brits investing in the stock market features which furry friend as its mascot?",
    options: [
      {
        label: "A tabby cat",
        description: "A respectable pet, but not the campaign creature in question.",
        weight: 0,
      },
      {
        label: "A red squirrel",
        description: "That is the campaign mascot backing the push into retail investing.",
        weight: 3,
      },
      {
        label: "A raccoon",
        description: "Wrong continent, wrong mascot.",
        weight: 0,
      },
    ],
  },
  {
    id: "energy_split_trousers",
    prompt: "Which top UK energy figure once split his trousers on his way to meet the king, as reported to Morning Energy and Climate UK readers in 2025?",
    options: [
      {
        label: "Energy Secretary Ed Miliband",
        description: "A plausible Westminster mishap, but not the right protagonist.",
        weight: 0,
      },
      {
        label: "Octopus boss Greg Jackson",
        description: "He was the figure at the centre of that memorable anecdote.",
        weight: 3,
      },
      {
        label: "Terrapower founder Bill Gates",
        description: "Memorable enough, but not the answer here.",
        weight: 0,
      },
    ],
  },
  {
    id: "trade_uk_eu_summit",
    prompt: "When do officials hope to hold the delayed U.K.-EU summit?",
    options: [
      {
        label: "Mid-October",
        description: "That is the target window officials are aiming for.",
        weight: 3,
      },
      {
        label: "Mid-2027",
        description: "That would be a delay of a very different order.",
        weight: 0,
      },
      {
        label: "\"In due course\"",
        description: "That sounds like classic official fog, but it is not the hoped-for timing.",
        weight: 0,
      },
    ],
  },
  {
    id: "politics_fourth_of_july",
    prompt: "Which prominent figure turned down an invitation to the U.S. Embassy's Fourth of July party last week due to a scheduling conflict?",
    options: [
      {
        label: "Prime Minister Keir Starmer",
        description: "A fair guess, but not the figure in question.",
        weight: 0,
      },
      {
        label: "Former U.S. Ambassador Peter Mandelson",
        description: "High profile, but not the one who declined on scheduling grounds.",
        weight: 0,
      },
      {
        label: "Makerfield MP Andy Burnham",
        description: "He was the figure who could not make the embassy celebration.",
        weight: 3,
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
  durationMs: z.number().int().min(0).max(600000),
  email: z.string().trim().optional().default(""),
  firstName: z.string().trim().optional().default(""),
  lastName: z.string().trim().optional().default(""),
  company: z.string().trim().optional().default(""),
  jobTitle: z.string().trim().optional().default(""),
  enterPrizeDraw: z.boolean(),
  privacyPolicyAccepted: z.boolean(),
  consentMarketing: z.boolean(),
  answers: z.array(answerSchema).length(5),
}).superRefine((value, context) => {
  if (value.enterPrizeDraw && !z.email().safeParse(value.email).success) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Email is required to enter the prize draw.",
    });
  }

  if (value.enterPrizeDraw && !value.firstName.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["firstName"],
      message: "First name is required to enter the prize draw.",
    });
  }

  if (value.enterPrizeDraw && !value.lastName.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["lastName"],
      message: "Last name is required to enter the prize draw.",
    });
  }

  if (value.enterPrizeDraw && !value.company.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["company"],
      message: "Organization is required to enter the prize draw.",
    });
  }

  if (value.enterPrizeDraw && !value.jobTitle.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["jobTitle"],
      message: "Role is required to enter the prize draw.",
    });
  }

  if (value.enterPrizeDraw && !value.privacyPolicyAccepted) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["privacyPolicyAccepted"],
      message: "You must accept the privacy policy before submitting.",
    });
  }
});

export type AnswerInput = z.infer<typeof answerSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type DemographicFields = Pick<
  SubmissionInput,
  | "email"
  | "firstName"
  | "lastName"
  | "company"
  | "jobTitle"
  | "enterPrizeDraw"
  | "privacyPolicyAccepted"
  | "consentMarketing"
>;

export function scoreAnswers(answers: AnswerInput[]) {
  return answers.reduce((total, answer) => total + answer.weight, 0);
}

export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}s`;
}

export function getResultMeta(score: number) {
  if (score >= 13) {
    return {
      title: "Lobby Legend",
      description: "You read the room, the order paper, and probably the footnotes too.",
    };
  }

  if (score >= 9) {
    return {
      title: "Policy Operator",
      description: "You are clearly fluent in the rhythms of Westminster and Whitehall.",
    };
  }

  if (score >= 5) {
    return {
      title: "Committee Room Contender",
      description: "You know your way around the basics and you are one briefing away from sharp form.",
    };
  }

  return {
    title: "Headline Skimmer",
    description: "You have the instincts. Now you just need a little more Westminster edge.",
  };
}
