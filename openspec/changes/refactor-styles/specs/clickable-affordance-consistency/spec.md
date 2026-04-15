## ADDED Requirements

### Requirement: Pointer cursor for button-like controls
All user-clickable button-like controls SHALL present pointer cursor affordance on hover in supported pointer environments.

#### Scenario: Shared button component exposes pointer affordance
- **WHEN** a user hovers a clickable control built from shared button primitives
- **THEN** the cursor changes to pointer

### Requirement: Non-primitive clickable controls align affordance
Clickable controls that are not built on the shared button primitive SHALL also expose pointer cursor behavior.

#### Scenario: Sidebar and menu actions maintain pointer affordance
- **WHEN** a user hovers custom clickable controls in sidebar or menu action surfaces
- **THEN** the cursor changes to pointer for those controls
