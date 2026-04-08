import type { ChatModel } from "../../lib/ai/models";

export const MOCK_MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-haiku",
    name: "Claude Haiku",
    provider: "Anthropic",
    description: "Fast and lightweight",
  },
  {
    id: "anthropic/claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Balanced performance",
  },
  {
    id: "google/gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    description: "Fast multimodal model",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Flagship model",
  },
];

export const MOCK_PROVIDERS = ["Anthropic", "Google", "OpenAI"] as const;
