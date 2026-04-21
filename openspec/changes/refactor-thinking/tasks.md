## 1. Backend Schema and Types

- [x] 1.1 Add mode field to postRequestBodySchema in app/(chat)/api/chat/schema.ts with enum ["fast", "thinking"] and default "fast"
- [x] 1.2 Update PostRequestBody type to include mode field
- [x] 1.3 Verify schema validation works for mode parameter

## 2. Provider Layer Cleanup

- [x] 2.1 Remove THINKING_SUFFIX_REGEX constant from lib/ai/providers.ts
- [x] 2.2 Remove isReasoningModel detection logic from getLanguageModel function
- [x] 2.3 Remove cleanModelId logic and use rawModelId directly
- [x] 2.4 Remove conditional wrapLanguageModel call with extractReasoningMiddleware
- [x] 2.5 Ensure getLanguageModel returns unwrapped model instance

## 3. Chat API Route Refactoring

- [x] 3.1 Extract mode parameter from requestBody with default "fast"
- [x] 3.2 Add isThinkingMode boolean based on mode === "thinking"
- [x] 3.3 Import wrapLanguageModel and extractReasoningMiddleware in route.ts
- [x] 3.4 Get provider instance after model validation (already exists at line 109)
- [x] 3.5 Add provider format validation for thinking mode (return 400 if not anthropic/openai)
- [x] 3.6 Wrap model with extractReasoningMiddleware when isThinkingMode is true
- [x] 3.7 Build providerOptions based on provider.format for Anthropic (anthropic.thinking.type="enabled", budgetTokens=10000)
- [x] 3.8 Build providerOptions based on provider.format for OpenAI (thinking.type="enabled")
- [x] 3.9 Remove conditional activeTools logic - use all tools in both modes
- [x] 3.10 Update streamText call to use providerOptions
- [x] 3.11 Update toUIMessageStream to use sendReasoning: isThinkingMode

## 4. Prompt Cleanup

- [x] 4.1 Remove isReasoningModel detection from lib/ai/prompts.ts systemPrompt function
- [x] 4.2 Remove conditional artifactsPrompt inclusion - always include it
- [x] 4.3 Verify systemPrompt returns consistent prompt for all modes

## 5. Frontend Toggle Component

- [x] 5.1 Create components/thinking-mode-toggle.tsx component
- [x] 5.2 Add ThinkingModeToggle component with value and onChange props
- [x] 5.3 Implement toggle button with BrainIcon from lucide-react
- [x] 5.4 Add conditional styling for active (thinking) vs inactive (fast) states
- [x] 5.5 Add tooltips: "Deep thinking enabled" for thinking, "Standard response" for fast
- [x] 5.6 Export ThinkingModeToggle component

## 6. MultimodalInput Integration

- [x] 6.1 Import ThinkingModeToggle component in components/multimodal-input.tsx
- [x] 6.2 Add thinkingMode state using useLocalStorage hook with key "thinking-mode" and default "fast"
- [x] 6.3 Add ThinkingModeToggle to PromptInputTools after ModelSelectorCompact
- [x] 6.4 Pass thinkingMode value and setThinkingMode onChange to toggle component
- [x] 6.5 Update sendMessage call to include mode: thinkingMode in message or request body
- [x] 6.6 Verify mode is transmitted with each message

## 7. Attachments Button Update

- [x] 7.1 Remove isReasoningModel logic from AttachmentsButton in components/multimodal-input.tsx
- [x] 7.2 Update disabled prop to only check status !== "ready"
- [x] 7.3 Verify attachments work in both fast and thinking modes

## 8. Testing and Verification

- [x] 8.1 Test fast mode with Anthropic provider - verify no thinking configuration
- [x] 8.2 Test thinking mode with Anthropic provider - verify thinking configuration and reasoning display
- [x] 8.3 Test thinking mode with OpenAI provider - verify thinking configuration
- [x] 8.4 Test thinking mode with unsupported provider - verify 400 error returned
- [x] 8.5 Test all tools available in fast mode (getWeather, createDocument, updateDocument, requestSuggestions, retrieveDocuments)
- [x] 8.6 Test all tools available in thinking mode
- [x] 8.7 Test mode persistence - toggle to thinking, refresh page, verify thinking mode restored
- [x] 8.8 Test mode persistence - verify defaults to fast on first load
- [x] 8.9 Test toggle UI states - verify visual feedback for active/inactive
- [x] 8.10 Test tooltips display correctly
- [x] 8.11 Verify existing chat functionality unchanged when using fast mode
- [x] 8.12 Test model IDs with "-thinking" suffix - verify they don't auto-enable thinking
