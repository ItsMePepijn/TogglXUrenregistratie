export function parseDescription(
  description: string,
  selectorRegex: RegExp,
): { pbiNumber: string; description: string } | null {
  const match = description.match(selectorRegex);

  return !match || match.length < 3
    ? null
    : {
        pbiNumber: match[1],
        description: match[2].trim(),
      };
}
