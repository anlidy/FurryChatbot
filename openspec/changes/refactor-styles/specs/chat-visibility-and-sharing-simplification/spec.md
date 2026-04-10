## ADDED Requirements

### Requirement: Private-by-default chat creation
The system SHALL create new chats with private visibility by default without requiring user selection in the chat UI.

#### Scenario: New chat created without visibility selector input
- **WHEN** a user sends the first message to create a new chat
- **THEN** the chat is persisted with private visibility

### Requirement: Visibility selector removal
The chat UI SHALL NOT expose private/public visibility toggle controls in the chat header or sidebar item menus.

#### Scenario: Visibility controls are not rendered
- **WHEN** a user views chat header and chat history item actions
- **THEN** private/public toggle controls are absent

### Requirement: Shared action in chat header
The chat UI SHALL provide a `Shared` action button in the top-right area of the chat page header.

#### Scenario: Shared action visible in header
- **WHEN** a user opens a chat page
- **THEN** a `Shared` action control is available in the header right-side action group
