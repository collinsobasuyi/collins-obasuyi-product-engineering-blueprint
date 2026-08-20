import * as anthropic from "./anthropic.js";
import * as openai from "./openai.js";

const PROVIDERS = {
  anthropic,
  openai
};

export const SUPPORTED_PROVIDER_NAMES = Object.keys(PROVIDERS);

export function getConfiguredProvider() {
  const providerName = process.env.BLUEPRINT_AI_PROVIDER;

  if (!providerName) {
    return null;
  }

  const provider = PROVIDERS[providerName];

  if (!provider) {
    throw new Error(
      `Unknown BLUEPRINT_AI_PROVIDER: "${providerName}". Supported: ${SUPPORTED_PROVIDER_NAMES.join(", ")}.`
    );
  }

  return provider;
}
