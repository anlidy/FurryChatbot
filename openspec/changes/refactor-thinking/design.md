## Context

The current implementation infers thinking mode from model ID patterns (`-thinking` suffix, `reasoning` keyword) in `lib/ai/providers.ts`. This creates tight coupling between model naming and behavior, limits tool availability in thinking mode, and only properly configures Anthropic providers. The refactor moves thinking mode control to explicit user choice via UI toggle.

**Current State:**
- `getLanguageModel()` checks model ID patterns and auto-wraps with reasoning middleware
- Chat route limits tools to only `retrieveDocuments` when reasoning detected
- Only Anthropic gets `providerOptions.anthropic.thinking` configuration
- No user control over when to use thinking mode

**Constraints:**
- Must support both Anthropic and OpenAI provider formats
- Cannot break existing chat functionality
- Must maintain reasoning content display in UI
- localStorage for preference persistence

## Goals / Non-Goals

**Goals:**
- User-controlled thinking mode via toggle UI
- Consistent thinking configuration for Anthropic and OpenAI
- All tools available in both fast and thinking modes
- Explicit error when unsupported provider attempts thinking
- Remove all model ID-based reasoning inference

**Non-Goals:**
- Supporting providers beyond Anthropic and OpenAI for thinking mode
- Backward compatibility with `-thinking` suffix model IDs
- Per-chat or per-conversation mode settings (using per-message mode)
- Auto-detection of when thinking would be beneficial

## Decisions

### Decision 1: Toggle UI over dropdown selector
**Choice:** Use toggle button instead of dropdown select for mode switching.

**Rationale:** 
- Binary choice (fast/thinking) fits toggle pattern better than select
- Faster interaction - single click vs click + select
- Less visual clutter in already-dense input toolbar
- Matches patterns like Claude's "Extended thinking" toggle

**Alternatives considered:**
- Dropdown select: More scalable if adding modes, but overkill for two options
- Keyboard shortcut only: Less discoverable for new users

### Decision 2: Remove reasoning logic from providers.ts
**Choice:** `getLanguageModel()` returns unwrapped model; chat route handles all reasoning configuration.

**Rationale:**
- Separates concerns: provider layer gets models, route layer configures behavior
- Enables mode to be request-specific rather than model-specific
- Simplifies provider logic - no conditional wrapping
- Makes reasoning configuration explicit and visible in route

**Alternatives considered:**
- Pass mode parameter to `getLanguageModel()`: Adds complexity to provider API, affects all callers
- Keep auto-detection as fallback: Maintains fragile coupling we're trying to remove

### Decision 3: Unified tool availability
**Choice:** All tools available in both fast and thinking modes.

**Rationale:**
- Original restriction was arbitrary - thinking models can use tools effectively
- Simplifies code - no conditional tool lists
- Better UX - users don't lose functionality when enabling thinking
- Specs explicitly require this behavior

**Alternatives considered:**
- Keep restricted tools in thinking: No technical reason to maintain this limitation

### Decision 4: Error on unsupported provider thinking
**Choice:** Return HTTP 400 error when non-Anthropic/OpenAI provider attempts thinking mode.

**Rationale:**
- Explicit failure better than silent degradation
- User gets clear feedback about limitation
- Prevents confusion about whether thinking is active
- Aligns with user's requirement for error over fallback

**Alternatives considered:**
- Silent fallback to fast mode: Hides capability gap, confusing UX
- Warning but proceed: Still unclear to user what happened

### Decision 5: localStorage for mode persistence
**Choice:** Store mode preference in localStorage with key "thinking-mode".

**Rationale:**
- Simple, no backend changes needed
- Per-browser persistence matches user expectation
- Easy to implement with useLocalStorage hook
- No privacy concerns - just UI preference

**Alternatives considered:**
- User profile setting: Overkill, requires backend changes
- Session storage: Loses preference on tab close
- No persistence: Forces users to re-toggle frequently

### Decision 6: OpenAI thinking configuration
**Choice:** Use `providerOptions.thinking` (not `extra_body`) for OpenAI.

**Rationale:**
- Cleaner API surface
- Consistent with Anthropic pattern
- User explicitly requested this approach
- Vercel AI SDK supports this format

**Alternatives considered:**
- `extra_body`: More verbose, less type-safe

## Risks / Trade-offs

**Risk:** OpenAI thinking configuration may not work as expected
→ **Mitigation:** Test with actual OpenAI o1/o3 models; fallback to Anthropic-only if needed

**Risk:** Breaking change for users with `-thinking` suffix models
→ **Mitigation:** Acceptable per requirements; users can use toggle instead

**Risk:** localStorage not available (private browsing, etc.)
→ **Mitigation:** useLocalStorage hook handles gracefully, defaults to "fast"

**Trade-off:** Per-message mode vs per-chat mode
- **Chosen:** Per-message (mode sent with each request)
- **Trade-off:** More flexible but requires passing mode through request flow
- **Benefit:** Users can mix fast and thinking in same conversation

**Trade-off:** Explicit error vs silent fallback for unsupported providers
- **Chosen:** Explicit error
- **Trade-off:** Slightly worse UX for edge case
- **Benefit:** Clear feedback, no confusion about whether thinking is active

## Migration Plan

**Deployment:**
1. Deploy backend changes first (mode parameter optional, defaults to "fast")
2. Verify existing functionality unchanged
3. Deploy frontend with toggle UI
4. Monitor for errors on unsupported provider thinking attempts

**Rollback:**
- Backend: Mode parameter is optional, can revert without breaking frontend
- Frontend: Remove toggle, revert to previous MultimodalInput version
- No data migration needed (localStorage is additive)

**User Communication:**
- Users with `-thinking` suffix models: Toggle now controls thinking mode
- No action required for most users (default behavior unchanged)

## Open Questions

None - design is complete and ready for implementation.
