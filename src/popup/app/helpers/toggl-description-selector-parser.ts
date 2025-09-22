import { DESCRIPTION_SELECTOR_TOKENS } from '../constants/description-selector.constant';
import { ParsedDescriptionSelector } from '../models/parsed-description-selector.model';

export function parseTogglDescriptionSelctorToRegex(
  descriptionSelector: string,
): ParsedDescriptionSelector {
  const pbiPosition = descriptionSelector.indexOf(
    DESCRIPTION_SELECTOR_TOKENS.PBI,
  );
  const descriptionPosition = descriptionSelector.indexOf(
    DESCRIPTION_SELECTOR_TOKENS.DESCRIPTION,
  );

  let indexes: { pbi: number; description: number } | null = null;

  if (pbiPosition < descriptionPosition) {
    indexes = { pbi: 1, description: 2 };
  } else {
    indexes = { pbi: 2, description: 1 };
  }

  descriptionSelector = descriptionSelector.replace(
    DESCRIPTION_SELECTOR_TOKENS.PBI,
    '(\\d+)',
  );
  descriptionSelector = descriptionSelector.replace(
    DESCRIPTION_SELECTOR_TOKENS.DESCRIPTION,
    '(.*)',
  );

  return {
    regex: new RegExp(descriptionSelector),
    pbiGroupIndex: indexes.pbi,
    descriptionGroupIndex: indexes.description,
  };
}
