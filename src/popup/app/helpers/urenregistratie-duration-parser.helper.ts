export function parseUrenregistratieDurationToSeconds(
  duration: string,
): number | null {
  const match = duration.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (match == null) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return null;

  return hours * 3600 + minutes * 60;
}
