## Why

The current chat UI has inconsistent interaction affordances and a sidebar workflow that does not match the desired compact/expanded behavior. A focused style refactor is needed now to align the product with the target interaction model and improve visual consistency.

## What Changes

- Standardize click affordance by ensuring all clickable button-like controls use pointer cursor behavior.
- Remove the sidebar "Delete All Chats" action and its associated confirmation flow.
- Restructure sidebar layout so controls are grouped at the top, history is below, and collapsed mode shows a compact icon-only action rail.
- Remove private/public visibility toggles from UI flows and default new chats to private.
- Replace visibility controls with a dedicated `Shared` action in the chat page header (top-right).
- Update chat canvas and message visual styles:
  - Chat background to a warm neutral tone (`#F8F8F6`-like).
  - User bubble background to a neutral tone (`#EFEEEB`-like) with smaller corner radius.
  - Remove assistant avatar from message rendering.

## Capabilities

### New Capabilities

- `sidebar-layout-refactor`: Sidebar control placement, collapse behavior, and action grouping updates.
- `chat-visibility-and-sharing-simplification`: Remove visibility toggles, default chats to private, and expose a header-level shared action.
- `chat-surface-and-message-restyle`: Chat background and message presentation updates (assistant avatar removal and user bubble restyle).
- `clickable-affordance-consistency`: Ensure button-like interactive controls consistently expose pointer cursor behavior.

### Modified Capabilities

None.

## Impact

- Affected UI components include sidebar, chat header, chat body, and message rendering components.
- Affected request contract includes chat creation payload handling where visibility is currently passed from client.
- Potentially affected tests include sidebar interaction, chat header actions, and message snapshot/visual assertions.
- No new external dependencies are expected.
