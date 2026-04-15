## ADDED Requirements

### Requirement: Chat canvas background restyle
The chat interface SHALL use a light neutral background tone equivalent to `#F8F8F6` for the primary chat surface.

#### Scenario: Chat page renders with neutral canvas background
- **WHEN** a user opens the chat interface
- **THEN** the visible chat canvas background matches the configured neutral restyle color

### Requirement: Assistant message avatar removal
Assistant messages SHALL render without an avatar icon.

#### Scenario: Assistant response appears without avatar
- **WHEN** an assistant message is displayed in the conversation
- **THEN** no leading assistant avatar element is rendered

### Requirement: User message bubble restyle
User messages SHALL use a neutral bubble background equivalent to `#EFEEEB` and a smaller corner radius than the previous style.

#### Scenario: User message bubble uses updated style
- **WHEN** a user message is rendered in conversation
- **THEN** the message bubble uses the new neutral background and reduced rounding
