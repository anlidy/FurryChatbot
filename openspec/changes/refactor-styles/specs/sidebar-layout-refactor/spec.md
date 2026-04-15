## ADDED Requirements

### Requirement: Sidebar action hierarchy and placement
The sidebar SHALL place primary actions at the top of the sidebar, with chat history rendered below the action area in expanded mode.

#### Scenario: Expanded sidebar shows top actions and history
- **WHEN** the sidebar is in expanded desktop mode
- **THEN** top-level controls (including toggle and new chat) are visible in the sidebar header area and history entries render below them

### Requirement: Sidebar compact icon mode
The sidebar SHALL support a collapsed icon-only mode where action controls remain accessible as a vertical icon rail.

#### Scenario: Collapsed sidebar displays icon-only controls
- **WHEN** the user collapses the sidebar
- **THEN** the sidebar renders a compact column of action icons without full text labels

### Requirement: Sidebar toggle control location
The sidebar toggle control SHALL be positioned at the top-right area of the sidebar container.

#### Scenario: Toggle appears in sidebar top-right region
- **WHEN** the sidebar is rendered
- **THEN** the toggle control is presented in the sidebar's top-right visual region instead of the chat header

### Requirement: Remove bulk delete action
The sidebar SHALL NOT expose a "Delete All Chats" action.

#### Scenario: Bulk delete is absent from sidebar controls
- **WHEN** a user opens the sidebar action area
- **THEN** no control for deleting all chats is presented
