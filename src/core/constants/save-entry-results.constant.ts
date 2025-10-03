import { SaveEntryResult } from '../models/save-entry-result.model';

const SUCCESS: SaveEntryResult = { success: true, errorMessage: null };

const FAILED: SaveEntryResult = {
  success: false,
  errorMessage: 'An unknown error occurred',
};

const NO_DESCRIPTION: SaveEntryResult = {
  success: false,
  errorMessage: 'Time entry description was not found',
};

const NO_SELECTOR_SETTING: SaveEntryResult = {
  success: false,
  errorMessage: 'Description selector setting was not found',
};

const DESCRIPTION_PARSING_FAILED: SaveEntryResult = {
  success: false,
  errorMessage: 'Failed to parse description with the given selector',
};

const OUTER_FORM_ELEMENT_NOT_FOUND: SaveEntryResult = {
  success: false,
  errorMessage: 'Outer form element not found on the page',
};

const DATE_ELEMENT_NOT_FOUND: SaveEntryResult = {
  success: false,
  errorMessage: 'Date input element not found on the page',
};

const EMPLOYEE_ID_ELEMENT_NOT_FOUND: SaveEntryResult = {
  success: false,
  errorMessage: 'EmployeeId input element not found on the page',
};

const INNER_FORM_ELEMENT_NOT_FOUND: SaveEntryResult = {
  success: false,
  errorMessage: 'Inner create form element not found on the page',
};

const NO_PBI_RESULTS_FOUND: SaveEntryResult = {
  success: false,
  errorMessage: 'No results found for the provided pbi',
};

const NO_DATA_FOR_FOUND_PBI: SaveEntryResult = {
  success: false,
  errorMessage: 'No data found for the fetched pbi',
};

const DESCRIPTION_VERIFICATION_FAILED: SaveEntryResult = {
  success: false,
  errorMessage: 'Returned pbi did not match expected',
};

const SAVE_BUTTON_NOT_FOUND: SaveEntryResult = {
  success: false,
  errorMessage: 'Save button not found on the page',
};

export const SAVE_ENTRY_RESULTS = {
  SUCCESS,
  FAILED,
  NO_DESCRIPTION,
  NO_SELECTOR_SETTING,
  DESCRIPTION_PARSING_FAILED,
  OUTER_FORM_ELEMENT_NOT_FOUND,
  DATE_ELEMENT_NOT_FOUND,
  EMPLOYEE_ID_ELEMENT_NOT_FOUND,
  INNER_FORM_ELEMENT_NOT_FOUND,
  NO_PBI_RESULTS_FOUND,
  NO_DATA_FOR_FOUND_PBI,
  DESCRIPTION_VERIFICATION_FAILED,
  SAVE_BUTTON_NOT_FOUND,
} as const;
