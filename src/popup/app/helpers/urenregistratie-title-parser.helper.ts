export function parseUrenregistratieTitleToPbi(
  description: string,
): string | null {
  const matches = Array.from(description.matchAll(/\((\d+)\)/g));

  return matches.length > 0 ? matches[matches.length - 1][1] : null;
}
