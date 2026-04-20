## Why

The current thinking mode implementation relies on fragile model ID naming conventions (e.g., `-thinking` suffix) and limits tool availability in reasoning mode. Users cannot manually control when to use deep thinking, and only Anthropic models are properly configured. This refactor makes thinking mode an explicit user choice with consistent multi-provider support.

## What Changes

- Add explicit thinking mode toggle in chat input UI (Fast/Thinking modes)
- Remove model ID-based reasoning detection logic
- Enable all tools (weather, documents, RAG, suggestions) in both modes
- Add proper thinking configuration for both Anthropic and OpenAI providers
- Persist user's mode preference in localStorage
- Return error when provider doesn't support thinking mode (instead of silent fallback)

## Capabilities

### New Capabilities
- `thinking-mode-toggle`: User-controlled toggle for switching between Fast and Deep Thinking modes with state persistence

### Modified Capabilities
- `ai-model-provider`: Extend provider configuration to support explicit thinking mode parameters for Anthropic and OpenAI formats
- `chat-api`: Modify chat API to accept mode parameter and configure models accordingly

## Impact

- **Frontend**: MultimodalInput component, new ThinkingModeToggle component, localStorage integration
- **Backend**: Chat API route, provider configuration logic, request schema
- **Breaking**: Removes automatic reasoning detection from model IDs - existing `-thinking` suffix models will no longer auto-enable thinking
- **User Experience**: Users gain explicit control over thinking mode; all tools available in both modes
