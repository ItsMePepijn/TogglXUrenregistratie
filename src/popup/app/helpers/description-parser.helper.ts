import { ParsedDescriptionSelector } from '../models/parsed-description-selector.model';

export function parseDescription(
  description: string,
  selector: ParsedDescriptionSelector,
): { pbiNumber: string; description: string } | null {
  const match = description.match(selector.regex);

  return !match || match.length < 3
    ? null
    : {
        pbiNumber: match[selector.pbiGroupIndex],
        description: match[selector.descriptionGroupIndex].trim(),
      };
}
