# London Playbook Summit Quiz

This repository is a standalone Next.js app for a five-question summit quiz with demographic capture and Neon-backed submission storage.

## Stack

- Next.js 16 with App Router
- Tailwind CSS 4
- Framer Motion for animation
- Neon Postgres for storage
- Vercel for hosting and deployment

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Add your Neon connection string to `.env.local`.

4. Run the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Neon setup

1. Create a new Neon project specifically for this app, for example `london-playbook-summit-quiz`.
2. Copy the connection string into `.env.local` as `DATABASE_URL`.
3. In the Neon SQL editor, run the contents of [db/schema.sql](/Users/fmartyn/Documents/Quiz App/db/schema.sql).

## GitHub and Vercel flow

1. Create a brand-new GitHub repository for this app only.
2. In GitHub Desktop, publish this local repository to that new remote.
3. In Vercel, create a new project by importing that GitHub repository.
4. In Vercel project settings, add `DATABASE_URL` from Neon.
5. Trigger the first deployment.
6. After this, every push from GitHub Desktop will redeploy automatically on Vercel.

## Recommended production names

- GitHub repo: `london-playbook-summit-quiz`
- Vercel project: `london-playbook-summit-quiz`
- Neon project: `london-playbook-summit-quiz-db`

## What to customize next

- Replace the placeholder quiz questions in [lib/quiz.ts](/Users/fmartyn/Documents/Quiz%20App/lib/quiz.ts).
- Decide whether demographic capture should stay at the start or move to the end.
- Add a tailored post-quiz result state or CRM handoff.
- Add email consent language that matches your legal requirements.
