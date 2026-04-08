## Why

The chatbot currently has no user-facing settings. Model providers are hardcoded via Vercel AI Gateway, users cannot customize API keys or base URLs, and profile information (name, avatar) is not editable. The dark mode toggle lives in the profile dropdown but belongs in settings. The overall UI uses a generic zinc theme that doesn't match the warm, modern aesthetic of claude.ai.

A Settings panel and UI overhaul are needed to: (1) give users full control over their AI providers and models by removing the gateway entirely, (2) provide profile customization, and (3) unify the visual language across sidebar, chat, and settings to match claude.ai's design.

## What Changes

- Add a Settings route (`/settings`) that renders in the right content area with the existing sidebar visible
- Settings page has a left tab navigation (General, Providers) and right content area, following claude.ai's layout pattern — left-aligned content, no dividing lines
- **General tab**: Edit profile (display name, avatar upload via Vercel Blob), preferences (theme)
- **Providers tab**: CRUD for custom AI providers with base URL, API key (encrypted in DB), and format selection (OpenAI-compatible or Anthropic-compatible)
- **Custom models**: Each provider can have multiple models, toggleable on/off
- **Remove Vercel AI Gateway entirely** — all models are user-configured via custom providers. No built-in/default model list. The app requires at least one provider to be configured before chatting.
- Remove `@ai-sdk/gateway` dependency; `getTitleModel()` and `getArtifactModel()` use user-configured models
- Remove dark mode toggle from the profile dropdown menu (moved to Settings General tab)
- **Global UI overhaul**: Apply claude.ai-inspired warm styling to sidebar, chat interface, and settings — not just settings-scoped
- New DB tables: `user_profile`, `custom_provider`, `custom_model`
- API Key encryption at rest using AES-256-GCM
- Add "Settings" entry to the profile dropdown menu in the sidebar footer

## Capabilities

### New Capabilities

- `settings-ui`: Settings page layout with tab navigation, route structure under `/settings`, and claude.ai-inspired styling applied globally (sidebar + chat + settings)
- `user-profile`: User profile management — display name, avatar upload, preferences storage
- `custom-providers`: Custom AI provider CRUD — name, base URL, API key (encrypted), format (openai/anthropic), with associated models
- `provider-integration`: Runtime integration of custom providers as the sole model source — no gateway, no built-in models

### Modified Capabilities

(none — no existing specs)

## Impact

- **Database**: 3 new tables (`user_profile`, `custom_provider`, `custom_model`), new migration
- **Schema**: `lib/db/schema.ts` extended with new table definitions
- **API routes**: New routes under `app/(chat)/api/settings/` for profile, providers, models CRUD and avatar upload
- **AI system**: `lib/ai/providers.ts` rewritten to remove gateway — all models from custom providers. `lib/ai/models.ts` stripped of hardcoded model list. `@ai-sdk/gateway` dependency removed.
- **UI components**: New settings page components, settings layout, provider/model management forms
- **Global theme**: Sidebar, chat interface, and settings all adopt claude.ai-inspired warm-toned styling
- **Sidebar**: `components/sidebar-user-nav.tsx` gets a new "Settings" menu item; dark mode toggle removed from dropdown
- **Dependencies**: `@ai-sdk/openai` and `@ai-sdk/anthropic` for provider instantiation; `@ai-sdk/gateway` removed; encryption utility added
- **Environment**: New `ENCRYPTION_KEY` env var required for API key encryption
