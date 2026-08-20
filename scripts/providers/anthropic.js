const DEFAULT_MODEL = "claude-sonnet-5";

export async function generate({ system, prompt, maxTokens = 4096 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Set it in your environment to use the Anthropic provider."
    );
  }

  const model = process.env.BLUEPRINT_AI_MODEL || DEFAULT_MODEL;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Anthropic API error (${response.status}): ${body}`
    );
  }

  const data = await response.json();
  const textBlock = (data.content || []).find(
    (block) => block.type === "text"
  );

  if (!textBlock) {
    throw new Error("Anthropic API returned no text content.");
  }

  return textBlock.text;
}
