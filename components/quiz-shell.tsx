"use client";

import { useState } from "react";

import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { QuizExperience } from "@/components/quiz-experience";
import type { CapturePosition, Question } from "@/lib/quiz";

type QuizShellProps = {
  questions: Question[];
  capturePosition: CapturePosition;
};

export function QuizShell({ questions, capturePosition }: QuizShellProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16.25rem] lg:items-start lg:gap-3.5">
      <div>
        <QuizExperience
          questions={questions}
          capturePosition={capturePosition}
          onSubmissionSaved={() => setRefreshKey((current) => current + 1)}
        />
      </div>
      <div>
        <LeaderboardPanel refreshKey={refreshKey} />
      </div>
    </div>
  );
}
