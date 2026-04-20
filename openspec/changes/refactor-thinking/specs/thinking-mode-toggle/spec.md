## ADDED Requirements

### Requirement: User can toggle thinking mode
The system SHALL provide a toggle control in the chat input interface that allows users to switch between Fast and Deep Thinking modes.

#### Scenario: Toggle to thinking mode
- **WHEN** user clicks the thinking mode toggle button
- **THEN** the toggle visual state changes to indicate thinking mode is active
- **AND** subsequent messages use deep thinking mode

#### Scenario: Toggle to fast mode
- **WHEN** user clicks the thinking mode toggle button while in thinking mode
- **THEN** the toggle visual state changes to indicate fast mode is active
- **AND** subsequent messages use fast mode

#### Scenario: Visual state indication
- **WHEN** thinking mode is active
- **THEN** the toggle button displays with highlighted/active styling
- **AND** a tooltip shows "Deep thinking enabled"

#### Scenario: Visual state indication for fast mode
- **WHEN** fast mode is active
- **THEN** the toggle button displays with default/inactive styling
- **AND** a tooltip shows "Standard response"

### Requirement: Mode preference persistence
The system SHALL persist the user's thinking mode preference across browser sessions.

#### Scenario: Mode preference saved
- **WHEN** user changes thinking mode
- **THEN** the preference is saved to localStorage with key "thinking-mode"
- **AND** the value is either "fast" or "thinking"

#### Scenario: Mode preference restored
- **WHEN** user loads the chat interface
- **THEN** the system reads the "thinking-mode" value from localStorage
- **AND** initializes the toggle to the saved mode
- **AND** defaults to "fast" if no preference exists

### Requirement: Mode transmitted with messages
The system SHALL include the current thinking mode with each user message sent to the backend.

#### Scenario: Fast mode message
- **WHEN** user sends a message with fast mode active
- **THEN** the request includes mode parameter set to "fast"

#### Scenario: Thinking mode message
- **WHEN** user sends a message with thinking mode active
- **THEN** the request includes mode parameter set to "thinking"

### Requirement: Toggle placement
The system SHALL position the thinking mode toggle between the model selector and submit button in the chat input toolbar.

#### Scenario: UI layout
- **WHEN** user views the chat input interface
- **THEN** the toggle appears after the model selector
- **AND** before the submit button
- **AND** maintains consistent spacing with other toolbar elements
