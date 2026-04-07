# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FurryChatbot is a Next.js chatbot application built with the AI SDK, featuring multi-model support via Vercel AI Gateway, authentication, and persistent chat history. The project uses React Server Components, Server Actions, and a modern TypeScript stack.

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Run migrations and build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Check code with Ultracite (Biome-based)
pnpm format           # Auto-fix code issues with Ultracite

# Database
pnpm db:migrate       # Run database migrations
pnpm db:generate      # Generate migration files from schema
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:push          # Push schema changes directly
pnpm db:pull          # Pull schema from database
pnpm db:check         # Check migration consistency
pnpm db:up            # Apply pending migrations

# Testing
pnpm test             # Run Playwright e2e tests
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
  - `(auth)/` - Authentication routes (login, register)
  - `(chat)/` - Main chat interface and chat-related routes
- `lib/` - Core business logic and utilities
  - `ai/` - AI model configuration, providers, prompts, and tools
  - `db/` - Database schema, migrations, and queries (Drizzle ORM)
  - `artifacts/` - Artifact generation logic (code, images, text, sheets)
  - `editor/` - Editor-related utilities
- `components/` - React components
  - `ui/` - shadcn/ui components
- `hooks/` - Custom React hooks
- `tests/` - Playwright test files
  - `e2e/` - End-to-end tests
  - `pages/` - Page object models
  - `prompts/` - Test prompts

### Key Technologies

- **Framework**: Next.js 16 with App Router, React 19, React Server Components
- **AI**: Vercel AI SDK with AI Gateway for multi-model support (OpenAI, Anthropic, Google, xAI)
- **Database**: Neon Serverless Postgres with Drizzle ORM
- **Auth**: Auth.js (NextAuth v5 beta)
- **Storage**: Vercel Blob for file uploads
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Code Quality**: Ultracite (Biome-based linter/formatter)
- **Testing**: Playwright for e2e tests

### AI Integration

The application uses Vercel AI Gateway as the default provider, which provides:
- Unified interface for multiple AI models
- Automatic OIDC authentication on Vercel deployments
- Fallback to `AI_GATEWAY_API_KEY` for non-Vercel deployments

AI configuration is in `lib/ai/`:
- `models.ts` - Model definitions and selection logic
- `providers.ts` - AI provider configuration
- `prompts.ts` - System prompts and prompt templates
- `tools/` - AI tool implementations

### Database Schema

Database schema is defined in `lib/db/schema.ts` using Drizzle ORM. Key tables include:
- Users and authentication
- Chats and messages
- Documents and suggestions
- Votes and feedback

Always run `pnpm db:migrate` after pulling changes that modify the schema.

### Code Quality Standards

This project uses **Ultracite** (Biome-based) for linting and formatting. Key rules from `.cursor/rules/ultracite.mdc`:

- **Accessibility**: Full WCAG compliance required - proper ARIA attributes, semantic HTML, keyboard navigation
- **TypeScript**: No `any`, no enums, use `import type`/`export type`, explicit array types
- **React**: No array index keys, hooks at top level, no nested component definitions
- **Code Style**: Arrow functions over function expressions, `for-of` over `.forEach()`, no `var`
- **Next.js**: Use `next/image` instead of `<img>`, proper `next/head` usage
- **Error Handling**: Always handle promises, no swallowed errors, meaningful error messages

Run `pnpm lint` before committing. Most issues can be auto-fixed with `pnpm format`.

### Environment Variables

Required environment variables are defined in `.env.example`. Key variables:
- `AI_GATEWAY_API_KEY` - Required for non-Vercel deployments
- `AUTH_SECRET` - NextAuth secret
- `POSTGRES_URL` - Database connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

Use `vercel env pull` to sync environment variables from Vercel.

## Development Workflow

1. **Starting Development**: Run `pnpm install` then `pnpm dev`
2. **Database Changes**: Modify `lib/db/schema.ts`, run `pnpm db:generate`, then `pnpm db:migrate`
3. **Adding Components**: Use shadcn/ui CLI or add to `components/ui/`
4. **AI Tools**: Add new tools in `lib/ai/tools/` and register in tool configuration
5. **Testing**: Write e2e tests in `tests/e2e/`, use page objects from `tests/pages/`

## Important Patterns

### Server Actions

Server Actions are used extensively for data mutations. They are defined in route files or separate action files and called from client components.

### Streaming Responses

The AI SDK's streaming capabilities are used for real-time chat responses. Use `useChat` hook for chat interfaces and `streamText` for server-side streaming.

### Artifact System

The application supports generating artifacts (code, images, text, sheets) through AI tools. Artifact logic is in `lib/artifacts/` and rendered in dedicated artifact components.

### Authentication

Auth.js is configured in `auth.ts` at the root. Protected routes use middleware or server-side session checks.
