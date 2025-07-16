export function getFormattedDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function reverseDate(date: string): string {
  const parts = date.split('-');
  return parts.reverse().join('-');
}
