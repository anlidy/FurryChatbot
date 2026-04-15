# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Project-Specific Guidelines

FurryChatbot is a Next.js 16 chatbot app using React 19, AI SDK, Auth.js, Drizzle ORM, and Tailwind CSS 4.
Core flows: authentication, streaming chat, and persistent chat/message data.

## Common Commands

```bash
# Development
pnpm dev
pnpm build
pnpm start

# Quality
pnpm lint
pnpm format

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:push
pnpm db:pull
pnpm db:check
pnpm db:up

# E2E tests
pnpm test
```

## Key Paths

- `app/` - App Router pages and layouts (`(auth)`, `(chat)`)
- `components/` - React UI components (`ui/` for shared primitives)
- `lib/ai/` - model/provider/prompt and tool integrations
- `lib/db/schema.ts` - Drizzle schema source of truth
- `lib/artifacts/` - artifact-related server logic
- `tests/e2e/` and `tests/pages/` - Playwright specs and page objects

## Environment Variables

Keep `.env.example` as source of required env keys. Current required keys:

- `AUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `POSTGRES_URL`
- `ENCRYPTION_KEY`

## Working Rules

- Prefer Server Actions and RSC patterns already used in `app/`.
- For schema changes: update `lib/db/schema.ts`, then run `pnpm db:generate` and `pnpm db:migrate`.
- Run `pnpm lint` before finishing; use `pnpm format` for autofix.
- Follow `.cursor/rules/ultracite.mdc` for style, accessibility, and TypeScript constraints.
