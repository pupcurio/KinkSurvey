# Spice Census

An anonymous, always-open survey that tracks how kinky people are over the years, with a fun
result at the end. Built with Next.js and meant to run on Vercel's free plan.

The design and all decisions are in [`docs/DESIGN.md`](docs/DESIGN.md).

## Development

Requires Node.js 20.9+ and a Postgres database (local, or a free Neon project in an EU region).

```bash
npm install
cp .env.example .env        # set DATABASE_URL
npm run db:migrate          # create the tables
npm run dev                 # http://localhost:3000
```

Checks:

```bash
npm test                    # unit tests (scoring, validation, codes, translations)
npm run typecheck
npm run lint
npm run build
```

## Where things live

| Path | What |
|---|---|
| `src/survey/questions.ts` | The questionnaire. Frozen after launch; read the header first. |
| `src/survey/scoring.ts` | Result: dimensions, spice level, archetype, interests |
| `src/survey/submission.ts` | Server-side validation and what gets stored |
| `src/survey/returningCode.ts` | Random returning code |
| `messages/*.json` | All display text, one file per language |
| `src/i18n/config.ts` | List of languages |
| `src/db/schema.ts`, `drizzle/` | Database schema and migrations |

## Adding a language

1. Copy `messages/en.json` to `messages/<code>.json` and translate it. Keys you leave out
   fall back to English.
2. Add one line to `src/i18n/config.ts`.
3. Run `npm test`. It fails until the new file has exactly the English keys, so translate
   everything before shipping.

## Changing the questionnaire

Don't, unless you have to. Read the freeze rule at the top of `src/survey/questions.ts`
and log the change in `docs/questionnaire/CHANGELOG.md`.

## Deploying

Import the repo in Vercel, set `DATABASE_URL` to the Neon **pooled** connection string,
and run `npm run db:migrate` once against it. `vercel.json` pins functions to Frankfurt (`fra1`).
