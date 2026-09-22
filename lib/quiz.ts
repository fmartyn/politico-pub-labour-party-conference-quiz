import { z } from "zod";

export const eventName = "Politico Pub at Labour Party Conference Quiz";
export const eventSlug = "politico-pub-labour-party-conference-quiz";
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
    id: "tech_ai_agents_hacking",
    prompt: "Which of these organizations accidentally hacked somewhere else when testing AI agents?",
    options: [
      {
        label: "Anthropic",
        description: "One of the organizations associated with the reported testing incidents.",
        weight: 0,
      },
      {
        label: "OpenAI",
        description: "Another major AI lab, but not the complete answer.",
        weight: 0,
      },
      {
        label: "The UK AI Security Institute",
        description: "A UK institution involved in AI safety and security testing.",
        weight: 0,
      },
      {
        label: "All of the above",
        description: "The reported answer is that all three organizations did this while testing AI agents.",
        weight: 3,
      },
    ],
  },
  {
    id: "tech_ai_development",
    prompt: "Which of these people are NOT in favor of slowing down AI development to make sure it does not kill us all?",
    options: [
      {
        label: "OpenAI boss Sam Altman",
        description: "He has warned about the risks of increasingly powerful AI systems.",
        weight: 0,
      },
      {
        label: "President Donald Trump",
        description: "The current answer, for now.",
        weight: 3,
      },
      {
        label: "Anthropic CEO Dario Amodei",
        description: "He has publicly discussed the need to manage advanced AI risks.",
        weight: 0,
      },
    ],
  },
  {
    id: "energy_cost_of_living",
    prompt: "What did Andy Burnham promise for people worried about the cost of living in his first speech as PM?",
    options: [
      { label: "A £100 cheque", description: "Not the phrase used in the speech.", weight: 0 },
      { label: "Free bus tickets", description: "Not the phrase used in the speech.", weight: 0 },
      { label: "Wiggle room", description: "Not the phrase used in the speech.", weight: 0 },
      { label: "A pint", description: "Not the phrase used in the speech.", weight: 0 },
      { label: "Breathing space", description: "The phrase used in the speech.", weight: 3 },
    ],
  },
  {
    id: "energy_community_power",
    prompt: "What could your local library become under Burnham's community power scheme?",
    options: [
      { label: "A nuclear power station", description: "Not the proposed community use.", weight: 0 },
      { label: "A community-owned solar farm", description: "The proposed community use.", weight: 3 },
      { label: "A grid connection point", description: "Not the proposed community use.", weight: 0 },
      { label: "Ofgem's new headquarters", description: "Not the proposed community use.", weight: 0 },
    ],
  },
  {
    id: "politics_no10_north",
    prompt: "Which of the following is NOT in No. 10 North?",
    options: [
      {
        label: "Hot-desking for ministers",
        description: "One of the features reported to be in No. 10 North.",
        weight: 0,
      },
      {
        label: "An elevator with unmarked buttons for GCHQ",
        description: "One of the unusual details associated with the building.",
        weight: 0,
      },
      {
        label: "A fake No. 10 door",
        description: "Another reported feature of No. 10 North.",
        weight: 0,
      },
      {
        label: "A collection of the works of Alan Bennett",
        description: "That is the odd one out and the correct answer.",
        weight: 3,
      },
      {
        label: "A cardboard cutout of Larry the Cat",
        description: "A memorable detail reported to be in the building.",
        weight: 0,
      },
    ],
  },
  {
    id: "politics_burnham_criticized",
    prompt: "What has Andy Burnham NOT criticized?",
    options: [
      {
        label: "People who queue single-file in pubs",
        description: "One of the habits he has criticized.",
        weight: 0,
      },
      {
        label: "People who play loud music on public transport",
        description: "One of the habits he has criticized.",
        weight: 0,
      },
      {
        label: "People who add milk first to their tea",
        description: "That is the correct answer. Burnham actually adds his milk first.",
        weight: 3,
      },
      {
        label: "People who use their phones too much at gigs",
        description: "One of the habits he has criticized.",
        weight: 0,
      },
      {
        label: "People who applaud when the plane lands",
        description: "One of the habits he has criticized.",
        weight: 0,
      },
    ],
  },
  {
    id: "trade_st_pancras_trains",
    prompt: "By the end of the decade, how many trains could run between London St. Pancras and mainland Europe every hour?",
    options: [
      { label: "Two", description: "Not the projected hourly total.", weight: 0 },
      { label: "Three", description: "Not the projected hourly total.", weight: 0 },
      { label: "Four", description: "The projected hourly total.", weight: 3 },
      { label: "Five", description: "Not the projected hourly total.", weight: 0 },
    ],
  },
  {
    id: "trade_uk_eu_reset",
    prompt: "Which of the following does not fall within the scope of the latest UK-EU reset negotiations?",
    options: [
      { label: "Food safety rules", description: "Within the scope of the negotiations.", weight: 0 },
      { label: "Carbon pricing terms", description: "Within the scope of the negotiations.", weight: 0 },
      { label: "Youth visas", description: "Within the scope of the negotiations.", weight: 0 },
      { label: "Fishing quotas", description: "Outside the scope of the negotiations.", weight: 3 },
    ],
  },
  {
    id: "fs_bank_taxes",
    prompt: "Which organisation is openly pushing for a hike in bank taxes?",
    options: [
      { label: "TheCityUK", description: "Not the organisation calling for the increase.", weight: 0 },
      { label: "Unite the Union", description: "Not the organisation calling for the increase.", weight: 0 },
      { label: "TUC", description: "The organisation calling for the increase.", weight: 3 },
      { label: "GMB", description: "Not the organisation calling for the increase.", weight: 0 },
    ],
  },
  {
    id: "fs_ai_valuations",
    prompt: "Who has not warned that soaring AI valuations could prompt a stock market correction?",
    options: [
      { label: "Andrew Bailey", description: "He has warned about the risks.", weight: 0 },
      { label: "John Healey", description: "He is the correct answer.", weight: 3 },
      { label: "Jamie Dimon", description: "He has warned about the risks.", weight: 0 },
      { label: "Pablo Hernández de Cos", description: "He has warned about the risks.", weight: 0 },
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
  answers: z.array(answerSchema).length(10),
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
  if (score >= 25) {
    return {
      title: "Lobby Legend",
      description: "You read the room, the order paper, and probably the footnotes too.",
    };
  }

  if (score >= 18) {
    return {
      title: "Policy Operator",
      description: "You are clearly fluent in the rhythms of Westminster and Whitehall.",
    };
  }

  if (score >= 10) {
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
