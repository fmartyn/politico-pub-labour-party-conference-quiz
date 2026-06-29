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
    id: "prime_ministers",
    prompt: "How many UK prime ministers have there been since January 2020?",
    options: [
      {
        label: "Three",
        description: "Close, but one key name is missing from the recent carousel.",
        weight: 1,
      },
      {
        label: "Four",
        description: "Correct. Johnson, Truss, Sunak, and Starmer have all held No. 10 in that span.",
        weight: 3,
      },
      {
        label: "Five",
        description: "A fair guess, but Westminster has not moved quite that fast.",
        weight: 0,
      },
    ],
  },
  {
    id: "pmqs",
    prompt: "What does PMQs stand for?",
    options: [
      {
        label: "Prime Minister's Questions",
        description: "Correct. The weekly Commons set-piece remains one of Westminster's best-known rituals.",
        weight: 3,
      },
      {
        label: "Parliamentary Media Queries",
        description: "Good acronym energy, but not a real Commons fixture.",
        weight: 0,
      },
      {
        label: "Public Mandate Quotient",
        description: "That sounds like a think-tank slide, not a House proceeding.",
        weight: 0,
      },
    ],
  },
  {
    id: "green_paper",
    prompt: "In UK policymaking, what is a green paper usually meant to do?",
    options: [
      {
        label: "Launch a consultation and float options",
        description: "Correct. A green paper generally tests ideas before firmer legislative moves.",
        weight: 3,
      },
      {
        label: "Announce a final government decision",
        description: "That is closer to where a white paper or bill lands.",
        weight: 0,
      },
      {
        label: "Trigger an immediate vote in both Houses",
        description: "Not at this stage. It is more about consultation than conclusion.",
        weight: 0,
      },
    ],
  },
  {
    id: "statutory_instrument",
    prompt: "Which answer best describes a statutory instrument?",
    options: [
      {
        label: "A form of secondary legislation made under powers granted by an Act",
        description: "Correct. This is classic delegated legislation territory.",
        weight: 3,
      },
      {
        label: "A formal coalition agreement between parties",
        description: "That might be politically useful, but it is not a statutory instrument.",
        weight: 0,
      },
      {
        label: "A private member's bill that has passed both Houses",
        description: "This answer confuses an Act with the delegated rules that follow from it.",
        weight: 0,
      },
    ],
  },
  {
    id: "kings_speech",
    prompt: "Which annual event sets out the UK government's planned legislative agenda?",
    options: [
      {
        label: "The King's Speech",
        description: "Correct. It outlines the government's intended programme for the parliamentary session.",
        weight: 3,
      },
      {
        label: "The Autumn Statement",
        description: "Important, but focused on fiscal policy rather than the whole legislative slate.",
        weight: 0,
      },
      {
        label: "The Speaker's Procession",
        description: "Ceremonial, yes. Agenda-setting, no.",
        weight: 0,
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
  firstName: z.string().trim().optional().default(""),
  lastName: z.string().trim().optional().default(""),
  company: z.string().trim().min(1),
  jobTitle: z.string().trim().min(1),
  enterPrizeDraw: z.boolean(),
  privacyPolicyAccepted: z.boolean(),
  consentMarketing: z.boolean(),
  answers: z.array(answerSchema).length(5),
}).superRefine((value, context) => {
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

  if (!value.privacyPolicyAccepted) {
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
