import { artifactsPrompt } from "./sections/artifacts";
import { buildIdentitySection } from "./sections/identity";
import { buildLocationSection } from "./sections/location";
import { buildToolGuidelinesSection } from "./sections/tools";
import type { PromptContext } from "./types";

/**
 * SystemPromptBuilder constructs static system prompts from modular sections.
 *
 * Architecture:
 * - Static prompts are built once and reused across conversations
 * - Dynamic content (document status, retrieved context) is injected as separate system messages
 * - Each section is modular and can be tested/modified independently
 *
 * Benefits:
 * - Reduces token usage by not rebuilding static content
 * - Allows real-time dynamic information injection
 * - Improves maintainability through separation of concerns
 */
export class SystemPromptBuilder {
  /**
   * Build the complete static system prompt
   */
  build(context: PromptContext): string {
    const sections = [
      buildIdentitySection(),
      buildLocationSection(context.requestHints),
      buildToolGuidelinesSection(),
      artifactsPrompt,
    ];

    return sections.join("\n\n");
  }
}

// Singleton instance for reuse
export const promptBuilder = new SystemPromptBuilder();
