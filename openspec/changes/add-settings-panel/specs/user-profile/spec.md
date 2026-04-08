## ADDED Requirements

### Requirement: User profile database storage
The system SHALL store user profile data in a `user_profile` table with fields: `id` (uuid, FK to user), `displayName` (varchar), `avatarUrl` (text, nullable), `preferences` (json), `updatedAt` (timestamp). The table SHALL have a 1:1 relationship with the `user` table.

#### Scenario: Profile created on first access
- **WHEN** a user accesses the settings page for the first time
- **THEN** the API returns default values (empty display name, null avatar, default preferences) and a profile row is created on first save

### Requirement: Edit display name
The system SHALL allow users to edit their display name through the General settings tab. The display name SHALL be persisted to the `user_profile` table.

#### Scenario: Save display name
- **WHEN** user enters "Alice" in the display name field and clicks Save
- **THEN** the display name is stored in `user_profile.displayName` and reflected in the UI

#### Scenario: Display name validation
- **WHEN** user enters a display name longer than 100 characters
- **THEN** the system rejects the input with a validation error

### Requirement: Avatar upload
The system SHALL allow users to upload an avatar image via a dedicated API route. The image SHALL be stored in Vercel Blob at path `avatars/{userId}` (overwriting previous uploads). Accepted formats: JPEG, PNG, WebP. Max size: 2MB.

#### Scenario: Successful avatar upload
- **WHEN** user selects a valid 500KB PNG image
- **THEN** the image is uploaded to Vercel Blob, the URL is saved to `user_profile.avatarUrl`, and the avatar preview updates

#### Scenario: Avatar fallback
- **WHEN** user has no custom avatar (avatarUrl is null)
- **THEN** the system displays the generated avatar from `avatar.vercel.sh/{email}`

#### Scenario: Invalid file rejected
- **WHEN** user attempts to upload a 5MB PDF file
- **THEN** the system rejects the upload with an appropriate error message

### Requirement: User preferences
The system SHALL store user preferences as a JSON object in `user_profile.preferences`. Supported preferences SHALL include `theme` (light/dark/system) and `defaultModel` (model ID string).

#### Scenario: Save theme preference
- **WHEN** user selects "Dark" theme in preferences and saves
- **THEN** the theme preference is persisted and the app theme updates accordingly

#### Scenario: Save default model
- **WHEN** user selects a model as their default in preferences
- **THEN** new chat sessions use this model instead of the hardcoded default
