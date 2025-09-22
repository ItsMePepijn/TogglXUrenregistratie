import { ParsedDescriptionSelector } from '../models/parsed-description-selector.model';

export function parseTogglDescription(
  description: string,
  selector: ParsedDescriptionSelector,
): { pbi: string; description: string } | null {
  const match = description.match(selector.regex);

  return !match || match.length < 3
    ? null
    : {
        pbi: match[selector.pbiGroupIndex],
        description: match[selector.descriptionGroupIndex].trim(),
      };
}
