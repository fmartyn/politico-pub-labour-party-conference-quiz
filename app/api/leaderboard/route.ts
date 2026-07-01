import { NextResponse } from "next/server";

import { getSql } from "@/lib/neon";
import { eventSlug } from "@/lib/quiz";

export async function GET() {
  try {
    const sql = getSql();

    const leaderboard = await sql`
      with ranked_entries as (
        select
          first_name,
          last_name,
          company,
          email,
          score,
          duration_ms,
          created_at,
          row_number() over (
            partition by lower(email)
            order by score desc, duration_ms asc, created_at asc
          ) as per_email_rank
        from quiz_submissions
        where event_slug = ${eventSlug}
          and first_name <> ''
          and last_name <> ''
      )
      select
        first_name,
        last_name,
        company,
        score,
        duration_ms,
        created_at
      from ranked_entries
      where per_email_rank = 1
      order by score desc, duration_ms asc, created_at asc
      limit 10
    `;

    const completionCount = await sql`
      select count(distinct lower(email))::int as total
      from quiz_submissions
      where event_slug = ${eventSlug}
    `;

    return NextResponse.json({
      ok: true,
      totalCompleted: completionCount[0]?.total ?? 0,
      entries: leaderboard.map((entry, index) => ({
        rank: index + 1,
        name: `${entry.first_name} ${entry.last_name}`.trim(),
        company: entry.company,
        score: entry.score,
        durationMs: entry.duration_ms,
      })),
    });
  } catch (error) {
    console.error("leaderboard_error", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The leaderboard could not be loaded.",
      },
      { status: 500 },
    );
  }
}
