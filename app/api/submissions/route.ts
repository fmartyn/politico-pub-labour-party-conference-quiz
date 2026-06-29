import { NextResponse } from "next/server";

import { getSql } from "@/lib/neon";
import { scoreAnswers, submissionSchema } from "@/lib/quiz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.parse(body);
    const sql = getSql();
    const score = scoreAnswers(parsed.answers);

    await sql`
      INSERT INTO quiz_submissions (
        event_slug,
        email,
        first_name,
        last_name,
        company,
        job_title,
        consent_marketing,
        capture_position,
        answers,
        quiz_version,
        score,
        raw_payload
      ) VALUES (
        ${parsed.eventSlug},
        ${parsed.email},
        ${parsed.firstName || ""},
        ${parsed.lastName || ""},
        ${parsed.company},
        ${parsed.jobTitle},
        ${parsed.consentMarketing},
        ${parsed.capturePosition},
        ${JSON.stringify(parsed.answers)}::jsonb,
        ${parsed.quizVersion},
        ${score},
        ${JSON.stringify(parsed)}::jsonb
      )
    `;

    return NextResponse.json({ ok: true, score });
  } catch (error) {
    console.error("submission_error", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The quiz submission could not be saved.",
      },
      { status: 500 },
    );
  }
}
