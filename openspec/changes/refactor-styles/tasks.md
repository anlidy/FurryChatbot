## 1. Sidebar Layout Refactor

- [ ] 1.1 Remove sidebar "Delete All Chats" control and related confirmation state/handlers.
- [ ] 1.2 Move sidebar toggle control into sidebar top-right action area.
- [ ] 1.3 Reorganize sidebar header so New Chat and related actions are grouped at top, with history list below.
- [ ] 1.4 Ensure collapsed sidebar mode renders icon-only action rail matching existing sidebar collapsible behavior.

## 2. Visibility and Sharing Simplification

- [ ] 2.1 Remove visibility selector UI from chat header and remove visibility submenu from sidebar history item actions.
- [ ] 2.2 Add a `Shared` button in chat header top-right action area.
- [ ] 2.3 Update client chat request flow to stop depending on `selectedVisibilityType` UI selection.
- [ ] 2.4 Update chat API schema/handler to create new chats with private visibility by default.

## 3. Chat Surface and Message Styling

- [ ] 3.1 Update chat page surface background to the target neutral tone (`#F8F8F6`-like).
- [ ] 3.2 Remove assistant avatar rendering from message UI.
- [ ] 3.3 Restyle user message bubbles with `#EFEEEB`-like background and reduced border radius.

## 4. Clickable Affordance Consistency

- [ ] 4.1 Add pointer cursor behavior to shared button primitive so common button controls inherit clickable affordance.
- [ ] 4.2 Patch non-primitive clickable controls (sidebar/menu custom actions) to preserve pointer affordance parity.

## 5. Verification

- [ ] 5.1 Run lint and resolve any issues introduced by the refactor.
- [ ] 5.2 Perform UI smoke checks for sidebar expanded/collapsed states, chat header actions, and message rendering updates.
