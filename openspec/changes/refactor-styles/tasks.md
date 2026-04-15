## 1. Sidebar Layout Refactor

- [x] 1.1 Remove sidebar "Delete All Chats" control and related confirmation state/handlers.
- [x] 1.2 Move sidebar toggle control into sidebar top-right action area.
- [x] 1.3 Reorganize sidebar header so New Chat and related actions are grouped at top, with history list below.
- [x] 1.4 Ensure collapsed sidebar mode renders icon-only action rail matching existing sidebar collapsible behavior.

## 2. Visibility and Sharing Simplification

- [x] 2.1 Remove visibility selector UI from chat header and remove visibility submenu from sidebar history item actions.
- [x] 2.2 Add a `Shared` button in chat header top-right action area.
- [x] 2.3 Update client chat request flow to stop depending on `selectedVisibilityType` UI selection.
- [x] 2.4 Update chat API schema/handler to create new chats with private visibility by default.

## 3. Chat Surface and Message Styling

- [x] 3.1 Update chat page surface background to the target neutral tone (`#F8F8F6`-like).
- [x] 3.2 Remove assistant avatar rendering from message UI.
- [x] 3.3 Restyle user message bubbles with `#EFEEEB`-like background and reduced border radius.

## 4. Clickable Affordance Consistency

- [x] 4.1 Add pointer cursor behavior to shared button primitive so common button controls inherit clickable affordance.
- [x] 4.2 Patch non-primitive clickable controls (sidebar/menu custom actions) to preserve pointer affordance parity.

## 5. Verification

- [x] 5.1 Run lint and resolve any issues introduced by the refactor.
- [ ] 5.2 Perform UI smoke checks for sidebar expanded/collapsed states, chat header actions, and message rendering updates.
