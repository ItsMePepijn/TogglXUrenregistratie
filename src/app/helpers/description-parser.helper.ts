export function parseDescription(
  description: string | null,
  selectorRegex: RegExp,
): { pbiNumber: string; description: string } | null {
  if (!description) {
    return null;
  }

  const match = description.match(selectorRegex);

  const pbiNumber = match ? match[1] : '';
  const descriptionWithoutPbi = match ? match[2] : '';

  return {
    pbiNumber,
    description: descriptionWithoutPbi.trim(),
  };
}
