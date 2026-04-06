## 1. Database & Encryption Foundation

- [x] 1.1 Create `lib/encryption.ts` with AES-256-GCM `encrypt()` and `decrypt()` functions, reading key from `ENCRYPTION_KEY` env var
- [x] 1.2 Add `user_profile`, `custom_provider`, `custom_model` tables to `lib/db/schema.ts` with proper types and foreign keys (cascade delete on custom_model → custom_provider)
- [x] 1.3 Generate and run Drizzle migration for the new tables
- [x] 1.4 Add CRUD query functions in `lib/db/queries.ts`: getUserProfile, upsertUserProfile, getCustomProviders, createCustomProvider, updateCustomProvider, deleteCustomProvider, getCustomModels, createCustomModel, deleteCustomModel, toggleCustomModel

## 2. Settings Route & Layout

- [x] 2.1 Add "Settings" menu item to `components/sidebar-user-nav.tsx` dropdown, linking to `/settings`
- [x] 2.2 Create `app/(chat)/settings/layout.tsx` with left vertical tab navigation (General, Providers) and right content area
- [x] 2.3 Create `app/(chat)/settings/page.tsx` that redirects to `/settings/general`
- [x] 2.4 Create `app/(chat)/settings/general/page.tsx` placeholder with header and back/close button

## 3. General Tab — Profile & Preferences

- [x] 3.1 Create API route `app/(chat)/api/settings/profile/route.ts` with GET (fetch profile) and PATCH (update displayName, preferences)
- [x] 3.2 Create API route `app/(chat)/api/settings/avatar/route.ts` for avatar upload to Vercel Blob (path `avatars/{userId}`, max 2MB, image only)
- [x] 3.3 Build General page UI: profile section (avatar with upload trigger, display name input), preferences section (theme selector)
- [x] 3.4 Wire up SWR hooks for profile data fetching and form submission

## 4. Providers Tab — CRUD UI & API

- [x] 4.1 Create API route `app/(chat)/api/settings/providers/route.ts` with GET (list providers with masked keys) and POST (create provider with encrypted key)
- [x] 4.2 Create API route `app/(chat)/api/settings/providers/[id]/route.ts` with PATCH (update provider) and DELETE (delete provider with cascade)
- [x] 4.3 Create API route `app/(chat)/api/settings/providers/[id]/models/route.ts` with GET, POST, DELETE for model management
- [x] 4.4 Build Providers list page UI: provider cards showing name, format badge, model count; empty state; "Add Provider" button
- [x] 4.5 Build Provider edit/create form: name, base URL, API key (masked), format selector (OpenAI/Anthropic), models list with add/remove/toggle
- [x] 4.6 Wire up SWR hooks for providers and models data fetching, form submission, and optimistic updates

## 5. Provider Integration into AI System

- [x] 5.1 Install `@ai-sdk/openai` and `@ai-sdk/anthropic` dependencies
- [x] 5.2 Modify `lib/ai/providers.ts` `getLanguageModel()` to detect `custom:` prefix and instantiate providers via `createOpenAI`/`createAnthropic` with decrypted credentials
- [x] 5.3 Create `lib/ai/custom-models.ts` to fetch and merge enabled custom models with built-in models, producing a combined list for the model selector
- [x] 5.4 Update `app/(chat)/api/chat/route.ts` to accept and validate `custom:` model IDs, checking provider ownership and enabled state
- [x] 5.5 Update model selector component to display custom models grouped under their provider name alongside built-in models

## 6. Polish & Wiring

- [x] 6.1 Update sidebar user nav to show custom avatar and display name (if set) instead of email
- [x] 6.2 Wire default model preference from user_profile into new chat initialization (replace cookie-only approach or layer on top)
- [x] 6.3 Add `ENCRYPTION_KEY` to `.env.example` with documentation
- [x] 6.4 Add zod validation schemas for all settings API inputs (profile, provider, model)

## 7. Refactor: Remove Gateway & Built-in Models

- [x] 7.1 Remove `@ai-sdk/gateway` dependency from `package.json` and run `pnpm install`
- [x] 7.2 Rewrite `lib/ai/providers.ts`: remove all `gateway.languageModel()` calls; `getLanguageModel()` now only resolves from custom providers (parse `providerId/modelId` format, fetch provider from DB, decrypt key, instantiate)
- [x] 7.3 Strip `lib/ai/models.ts`: remove `chatModels` array, `DEFAULT_CHAT_MODEL`, `allowedModelIds`, `modelsByProvider`. Keep only the `ChatModel` type definition
- [x] 7.4 Update `lib/ai/custom-models.ts`: remove `mergeModels()` — `getCustomModelsForUser()` is now the sole model source; update model ID format to `<providerId>/<modelId>` (remove `custom:` prefix)
- [x] 7.5 Refactor `getTitleModel()` and `getArtifactModel()` to accept `userId`, read `systemModel` from user preferences, fall back to first available enabled model
- [x] 7.6 Update `app/(chat)/api/chat/route.ts`: remove `allowedModelIds` check; validate model by checking provider existence and ownership; pass `userId` to `getTitleModel`/`getArtifactModel`
- [x] 7.7 Update model selector component: remove built-in models section; show only custom models from providers; add empty state prompting user to configure providers
- [x] 7.8 Update chat page: show setup prompt when user has no configured models, directing to Settings → Providers

## 8. Remove Dark Mode Toggle from Dropdown

- [x] 8.1 Remove the "Toggle dark/light mode" `DropdownMenuItem` from `components/sidebar-user-nav.tsx`; remove `useTheme` import if no longer needed there

## 9. Global Claude.ai-Inspired UI Overhaul

- [x] 9.1 Update root CSS custom properties (Tailwind theme) to shift from cool zinc/gray palette to warm tones (off-white/cream for light mode, warm dark for dark mode) — affects `--background`, `--foreground`, `--sidebar`, `--border`, `--accent` etc.
- [x] 9.2 Update sidebar styling (`components/app-sidebar.tsx`, sidebar UI components): warm background, soft hover states, matching claude.ai's left panel aesthetic
- [x] 9.3 Update chat interface styling (`app/(chat)/page.tsx`, message components, input area): warm tones, generous spacing, clean layout matching claude.ai
- [x] 9.4 Restyle settings layout (`app/(chat)/settings/layout.tsx`): left-aligned content, remove all dividing lines/card borders, spacing-only section separation, remove border-r from nav, remove border-b from header
- [x] 9.5 Restyle settings General and Providers pages to match new layout (no card wrappers, no horizontal rules, clean left-aligned sections)
- [x] 9.6 Verify dark mode consistency across all areas (sidebar, chat, settings) with warm dark palette
