const DEFAULT_MODEL = "gpt-4o";

export async function generate({ system, prompt, maxTokens = 4096 }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Set it in your environment to use the OpenAI provider."
    );
  }

  const model = process.env.BLUEPRINT_AI_MODEL || DEFAULT_MODEL;

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `OpenAI API error (${response.status}): ${body}`
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("OpenAI API returned no text content.");
  }

  return text;
}
