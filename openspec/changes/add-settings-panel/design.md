## Context

The app is a Next.js 16 (App Router) AI chatbot using Drizzle ORM + Neon PostgreSQL, shadcn/Radix UI, Tailwind v4, and NextAuth v5. AI models were previously hardcoded in `lib/ai/models.ts` and routed through Vercel AI Gateway in `lib/ai/providers.ts`. There are no user settings, no custom provider support, and no profile editing. The sidebar (`components/app-sidebar.tsx`) has a user nav dropdown with theme toggle and sign out.

## Goals / Non-Goals

**Goals:**
- Settings page as a route (`/settings/*`) sharing the existing sidebar layout
- General tab: editable display name, avatar (via Vercel Blob), theme preference
- Providers tab: full CRUD for custom providers (name, base URL, API key, format) and their models
- API keys encrypted at rest (AES-256-GCM)
- **Remove Vercel AI Gateway entirely** — all models come from user-configured custom providers
- **No built-in/default model list** — `chatModels` array and `DEFAULT_CHAT_MODEL` removed
- System functions (title generation, artifact creation) use user-configured models
- Remove dark mode toggle from profile dropdown (now in Settings)
- **Global claude.ai-inspired styling** — sidebar, chat, and settings all use warm-toned design

**Non-Goals:**
- Client-side image cropping for avatars (just upload)
- Provider "Test Connection" feature (future enhancement)
- Rate limiting or usage tracking for custom providers
- Settings sync across devices beyond what DB provides

## Decisions

### 1. Route-based settings vs Dialog

**Decision**: Route-based (`/settings/general`, `/settings/providers`)

Settings renders in `SidebarInset` (the right content area) like chat pages. A nested layout at `app/(chat)/settings/layout.tsx` provides the left tab navigation.

**Why not Dialog**: Claude.ai uses routes, gives more space, supports deep linking, and avoids complex state management for forms.

### 2. Database schema design

**Decision**: Three new tables with `user.id` as the anchor.

- `user_profile`: 1:1 with `user`, stores `displayName`, `avatarUrl`, `preferences` (JSON including `theme`, `systemModel`)
- `custom_provider`: N:1 with `user`, stores provider config including encrypted API key
- `custom_model`: N:1 with `custom_provider`, stores model ID and display name

Separate from `user` table to avoid altering the auth-managed table. `preferences` as JSON for flexibility (schema can evolve without migrations).

### 3. API key encryption

**Decision**: AES-256-GCM with a server-side `ENCRYPTION_KEY` env var.

A `lib/encryption.ts` module provides `encrypt(plaintext)` → `iv:authTag:ciphertext` and `decrypt(stored)` → `plaintext`. The key is 32 bytes from env, never exposed to client.

API responses return masked keys (last 4 chars visible: `sk-...abcd`). Full key is only used server-side when instantiating providers.

### 4. Remove gateway — all models from custom providers

**Decision**: Remove `@ai-sdk/gateway` dependency entirely. The hardcoded `chatModels` array in `lib/ai/models.ts` is removed. All model selection comes from user-configured custom providers in the database.

Model ID format: `<providerId>/<modelId>` (no `custom:` prefix since there are no built-in models to conflict with).

`getLanguageModel(modelId)` parses the `providerId` from the ID, fetches the provider from DB, decrypts the API key, and instantiates via `createOpenAI` or `createAnthropic`.

**Why**: The gateway is a Vercel-specific abstraction that limits flexibility. Fully custom providers give users complete control over which models and endpoints they use.

### 5. System models (title, artifact) from user config

**Decision**: `getTitleModel()` and `getArtifactModel()` read from the user's `systemModel` preference in `user_profile.preferences`. If not set, they fall back to the first available enabled model.

These functions now need a `userId` parameter to look up the right provider. The chat route already has the user session, so this is straightforward.

**Trade-off**: First-time users with no providers configured cannot chat or generate titles. The UI handles this by showing a setup prompt directing to Settings → Providers.

### 6. Provider format support

**Decision**: Two formats — OpenAI-compatible and Anthropic-compatible — using `@ai-sdk/openai` and `@ai-sdk/anthropic`.

```
format === "openai"     → createOpenAI({ baseURL, apiKey })
format === "anthropic"  → createAnthropic({ baseURL, apiKey })
```

This covers the vast majority of third-party providers (OpenRouter, Together, Groq, local Ollama, etc. are all OpenAI-compatible).

### 7. State management for settings

**Decision**: SWR for data fetching (consistent with existing patterns like `sidebar-history.tsx`), standard form state with React `useState`.

No new state library. Settings data flows: DB → API route → SWR hook → form → API route → DB.

### 8. Avatar upload

**Decision**: Reuse existing Vercel Blob infrastructure. Dedicated route `api/settings/avatar` with path `avatars/{userId}` (overwrite on re-upload, no suffix randomization). Fallback to `avatar.vercel.sh/{email}` if no custom avatar.

### 9. Global claude.ai-inspired styling

**Decision**: Apply warm-toned design language globally across sidebar, chat, and settings. NOT scoped to settings only.

Approach: Override Tailwind CSS variables / theme tokens at the root level to shift the color palette from cold zinc/gray to warm tones. Key changes:
- Sidebar: warm off-white/cream background (light), warm dark (dark)
- Chat area: matching warm tones, spacious layout
- Settings: left-aligned content, no card borders or dividing lines, generous spacing
- Consistent warm accent colors for interactive elements

This is a theme-level change using Tailwind's CSS custom properties, so it affects all components uniformly without per-component class overrides.

### 10. Remove dark mode toggle from dropdown

**Decision**: Remove the "Toggle dark/light mode" menu item from `sidebar-user-nav.tsx` dropdown. Theme selection is now available in Settings → General as a proper selector (light/dark/system), which is a better UX than a toggle that cycles between two states.

## Risks / Trade-offs

- **[No models without provider setup]** → New users must configure at least one provider before chatting. Mitigation: clear onboarding prompt in the empty model selector and chat area.
- **[Encryption key rotation]** → If `ENCRYPTION_KEY` changes, all stored API keys become unreadable. Mitigation: document this clearly; future enhancement could support key versioning.
- **[Custom provider errors surface to user]** → Bad base URL or invalid API key causes runtime errors during chat. Mitigation: clear error messages in chat UI indicating provider config issue; future "Test Connection" feature.
- **[System model availability]** → If user deletes the provider used for system tasks, title generation fails. Mitigation: graceful error handling, fallback to first available model.
- **[Vercel Blob dependency for avatars]** → Requires `BLOB_READ_WRITE_TOKEN`. Mitigation: graceful fallback to generated avatar if blob unavailable.
- **[Global theme change scope]** → Changing colors globally may have unintended effects on some components. Mitigation: use CSS custom properties for systematic control, test all views.
- **[Migration complexity]** → New tables only (no alterations), safe to deploy. Rollback: drop the 3 tables.
