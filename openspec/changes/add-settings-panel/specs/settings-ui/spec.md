## ADDED Requirements

### Requirement: Settings route structure
The system SHALL serve settings pages at `/settings/general` and `/settings/providers` under the `(chat)` route group, sharing the existing sidebar layout. Navigating to `/settings` SHALL redirect to `/settings/general`.

#### Scenario: Access settings from sidebar
- **WHEN** user clicks "Settings" in the profile dropdown menu
- **THEN** the browser navigates to `/settings/general` and the settings page renders in the right content area with the sidebar still visible

#### Scenario: Direct URL access
- **WHEN** user navigates directly to `/settings/providers`
- **THEN** the Providers tab renders with the left tab navigation showing "Providers" as active

#### Scenario: Root settings redirect
- **WHEN** user navigates to `/settings`
- **THEN** the browser redirects to `/settings/general`

### Requirement: Settings layout with tab navigation
The settings page SHALL have a left vertical tab navigation and a right content area. The tab navigation SHALL include "General" and "Providers" tabs. The active tab SHALL be visually indicated.

#### Scenario: Tab switching
- **WHEN** user clicks the "Providers" tab while on the General page
- **THEN** the browser navigates to `/settings/providers` and the content area updates to show the Providers page

#### Scenario: Active tab indicator
- **WHEN** the settings page loads at `/settings/general`
- **THEN** the "General" tab is visually highlighted as active in the left navigation

### Requirement: Settings content left-aligned, no dividers
The settings main content area SHALL be left-aligned (not centered or split-column). There SHALL be NO horizontal dividing lines or card borders separating content sections. Sections SHALL be separated by spacing only, following claude.ai's clean layout pattern.

#### Scenario: Content layout
- **WHEN** the General settings page renders
- **THEN** all content is left-aligned with generous vertical spacing between sections, no visible dividers or card borders

### Requirement: Settings header with back navigation
The settings page SHALL display a header with the title "Settings" and a close/back button that returns to the chat page.

#### Scenario: Close settings
- **WHEN** user clicks the close button in the settings header
- **THEN** the browser navigates back to the root chat page (`/`)

### Requirement: Remove dark mode toggle from profile dropdown
The profile dropdown menu in the sidebar SHALL NOT contain a "Toggle dark/light mode" option. Theme switching is handled in the Settings General tab instead.

#### Scenario: Dropdown menu items
- **WHEN** user opens the profile dropdown in the sidebar footer
- **THEN** the menu shows "Settings" and "Sign out" (no theme toggle)

### Requirement: Global claude.ai-inspired styling
The UI SHALL adopt claude.ai's warm visual language globally — not scoped to settings only. This includes the sidebar, chat interface, and settings pages. Key design tokens:

- **Background**: Warm off-white (light mode), warm dark (dark mode) instead of cool zinc/gray
- **Sidebar**: Warm-toned background with soft hover states, matching claude.ai's left panel
- **Chat area**: Clean, spacious layout with warm tones
- **Typography**: Clean sans-serif with comfortable line heights
- **Borders**: Minimal, soft, warm-toned where needed
- **Interactive elements**: Warm accent colors, smooth transitions

#### Scenario: Sidebar appearance
- **WHEN** the app renders in light mode
- **THEN** the sidebar uses a warm off-white/cream background similar to claude.ai, not cold gray/zinc

#### Scenario: Chat area appearance
- **WHEN** the user is in a chat conversation
- **THEN** the chat interface uses warm background tones and generous spacing, matching the settings page aesthetic

#### Scenario: Dark mode consistency
- **WHEN** the app renders in dark mode
- **THEN** all areas (sidebar, chat, settings) use a warm dark palette consistently
