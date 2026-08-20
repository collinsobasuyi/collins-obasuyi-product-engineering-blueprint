export function extractHeadingSection(content, headingName) {
  const lines = content.split("\n");
  let capturing = false;
  const captured = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,4})\s+(.*)$/);

    if (headingMatch) {
      if (capturing) {
        break;
      }

      if (headingMatch[2].trim() === headingName) {
        capturing = true;
      }

      continue;
    }

    if (capturing) {
      captured.push(line);
    }
  }

  return captured.join("\n").trim();
}
