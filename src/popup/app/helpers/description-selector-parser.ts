import { DESCRIPTION_SELECTOR_TOKENS } from '../constants/description-selector.constant';

export function parseDescriptionSelectrorToRegex(
  descriptionSelector: string,
): RegExp {
  descriptionSelector = descriptionSelector.replace(
    DESCRIPTION_SELECTOR_TOKENS.PBI,
    '(\\d+)',
  );
  descriptionSelector = descriptionSelector.replace(
    DESCRIPTION_SELECTOR_TOKENS.DESCRIPTION,
    '(.*)',
  );

  return new RegExp(descriptionSelector);
}
