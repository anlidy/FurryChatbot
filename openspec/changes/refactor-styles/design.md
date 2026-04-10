## Context

This change touches multiple cross-cutting UI surfaces in the chat product: sidebar shell layout, chat header controls, message presentation, and request payload shaping for chat visibility. The current implementation spreads these concerns across shared primitives (`components/ui/*`), feature-level components (`components/app-sidebar.tsx`, `components/chat-header.tsx`, `components/message.tsx`), and API validation (`app/(chat)/api/chat/schema.ts`).

The sidebar already uses a collapsible primitive with icon mode support, but control placement does not currently match the target UX. Visibility controls also exist in both sidebar item menus and chat header controls, and visibility is passed through the chat request payload even when the desired default behavior is private-only.

## Goals / Non-Goals

**Goals:**
- Align sidebar interaction model to expanded vs collapsed behavior with top-aligned actions and right-top toggle.
- Remove legacy "Delete All Chats" and visibility toggle affordances from user-facing UI.
- Establish private-by-default behavior in the chat creation flow without relying on client visibility selection.
- Introduce a header-level `Shared` action entry point.
- Apply visual style updates for chat canvas and message bubbles, including removal of assistant avatar.
- Improve clickable affordance consistency by normalizing pointer cursor behavior on button-like controls.

**Non-Goals:**
- No redesign of chat history grouping, pagination, or deletion of individual chats.
- No implementation of full sharing backend behavior changes beyond moving the action entry point.
- No dark-theme palette redesign beyond preserving existing behavior where possible.
- No migration of existing persisted chat visibility values in database records.

## Decisions

### 1) Use existing sidebar collapsible primitives instead of building custom state
- **Decision**: Reuse `components/ui/sidebar.tsx` collapse state (`expanded`/`collapsed`) and icon mode to drive layout changes.
- **Rationale**: Reduces risk and avoids introducing parallel sidebar state logic.
- **Alternative considered**: Add custom local state in `AppSidebar` for compact mode. Rejected due to duplication and inconsistency with keyboard shortcut/cookie persistence already implemented in sidebar provider.

### 2) Remove visibility selection from UI and request schema, force server-side private default
- **Decision**: Remove `VisibilitySelector` from chat header and remove visibility switching from sidebar history item menu. In `/api/chat` request parsing, stop requiring `selectedVisibilityType` and set `visibility: "private"` when creating new chats.
- **Rationale**: Matches product requirement ("chat default private" and no private/public control), simplifies client contract, and prevents stale UI logic from reintroducing non-private creation.
- **Alternative considered**: Keep payload field but hardcode "private" in client. Rejected because it preserves unnecessary contract complexity and leaves accidental divergence risk.

### 3) Introduce a header `Shared` action as a dedicated control surface
- **Decision**: Add a `Shared` button in the chat header top-right area as the single visible share entry point.
- **Rationale**: Centralizes sharing action discovery and aligns with requested UX.
- **Alternative considered**: Keep share option in per-chat sidebar menu only. Rejected as it conflicts with requirement to remove visibility controls from sidebar flow.

### 4) Apply style tokens/utility overrides at source components
- **Decision**: Update chat background and user bubble styling directly in chat/message components and optionally adjust root background token where needed.
- **Rationale**: Keeps change explicit and local to requested UI surfaces, reducing broad theme side effects.
- **Alternative considered**: Global token-only update for all surfaces. Rejected because it may unintentionally alter non-chat pages.

### 5) Cursor affordance normalization via shared button primitive first, then targeted exceptions
- **Decision**: Add pointer cursor in shared button primitive and patch non-Button interactive elements as needed.
- **Rationale**: Ensures broad coverage with minimal repeated class edits.
- **Alternative considered**: Manual per-component cursor classes only. Rejected for maintainability and easy omissions.

## Risks / Trade-offs

- **[Risk] Hidden dependencies on `VisibilityType` types across components** → **Mitigation**: Remove/replace imports incrementally and run typecheck/lint after each phase.
- **[Risk] Request schema mismatch during partial rollout** → **Mitigation**: Update client and server contract in the same implementation slice.
- **[Risk] Sidebar collapsed visual regressions on mobile/desktop breakpoints** → **Mitigation**: Validate both desktop and mobile sidebar rendering states after layout edits.
- **[Trade-off] Keeping existing public chats in DB while UI removes toggles** → **Mitigation**: Preserve read behavior for legacy data but prevent new public creation through updated defaults.

## Migration Plan

1. Update sidebar/chat header/message component structure and styles behind existing render paths.
2. Remove visibility selector UI and related per-item share visibility submenu.
3. Update API request schema and chat creation path to private-only default.
4. Run lint and targeted UI smoke tests for:
   - Sidebar expanded/collapsed interactions
   - New chat action
   - Chat header action visibility
   - Message rendering (assistant/user)
5. If regressions occur, rollback via reverting this change set; no data migration rollback needed.

## Open Questions

- Should `Shared` be visible for readonly viewers or owner-only?
- Should collapsed sidebar still expose a direct history navigation affordance beyond icon-only actions?
- Do we want the `#F8F8F6` and `#EFEEEB` colors as hardcoded values or promoted to semantic tokens immediately?
