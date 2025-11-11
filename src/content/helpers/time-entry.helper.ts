import { EXTENSION_MESSAGES } from '../../core/constants/messages.constant';
import { SAVE_ENTRY_RESULTS } from '../../core/constants/save-entry-results.constant';
import { ExtensionMessenger } from '../../core/helpers/extension-messager.helper';
import { FillTimeEntryRequestPayload } from '../../core/models/messages/fill-time-entry-request.model';
import { SaveEntryResult } from '../../core/models/save-entry-result.model';
import { SavedEntry } from '../../core/models/saved-entry.model';
import { BASE_URL } from '../constants/base-url.constant';
import { ELEMENT_SELECTORS } from '../constants/element-selectors.constant';
import { getSelectedDate } from './date.helper';

export async function fillTimeEntryGroup(
  timeEntryGroup: FillTimeEntryRequestPayload,
): Promise<SaveEntryResult> {
  try {
    const form = document.getElementById(ELEMENT_SELECTORS.FORM_SELECTION_ID);
    if (form == null) {
      console.warn('Form not found');
      return SAVE_ENTRY_RESULTS.OUTER_FORM_ELEMENT_NOT_FOUND;
    }

    const dateInput = form.querySelector('#Date') as HTMLInputElement | null;
    if (dateInput == null) {
      console.warn('Date input not found');
      return SAVE_ENTRY_RESULTS.DATE_ELEMENT_NOT_FOUND;
    }
    const date = dateInput.value;

    const employeeIdInput = form.querySelector(
      '#EmployeeId',
    ) as HTMLInputElement | null;
    if (employeeIdInput == null) {
      console.warn('EmployeeId input not found');
      return SAVE_ENTRY_RESULTS.EMPLOYEE_ID_ELEMENT_NOT_FOUND;
    }
    const employeeId = employeeIdInput.value;

    const createFormDiv = form.querySelector('#create-form');
    if (!createFormDiv) {
      console.warn('Create form div not found');
      return SAVE_ENTRY_RESULTS.INNER_FORM_ELEMENT_NOT_FOUND;
    }

    const pbiResponse = await fetch(
      `${BASE_URL}/Client/ListActive?page=1&SearchTerm=%23${timeEntryGroup.pbi}`,
    );
    const pbiBody = await pbiResponse.json();

    if (pbiBody == null || pbiBody.length === 0) {
      console.error('No results found for PBI: ', timeEntryGroup.pbi);
      return SAVE_ENTRY_RESULTS.NO_PBI_RESULTS_FOUND;
    }

    const firstItemChildren = pbiBody[0].children;
    if (
      firstItemChildren == null ||
      firstItemChildren.length === 0 ||
      firstItemChildren[0] == null
    ) {
      console.error(
        'No children found for first item of PBI: ',
        timeEntryGroup.pbi,
      );
      return SAVE_ENTRY_RESULTS.NO_DATA_FOR_FOUND_PBI;
    }

    const firstItem = firstItemChildren[0];

    const verifyDescriptionRegex = new RegExp(`#${timeEntryGroup.pbi} -`);
    if (!verifyDescriptionRegex.test(firstItem.text)) {
      console.warn('Description verification failed');
      return SAVE_ENTRY_RESULTS.DESCRIPTION_VERIFICATION_FAILED;
    }

    const postData = {
      ProductBacklogItemId: firstItem.id.replace('#', ''),
      ViewModelName: 'CreateTimeRegistrationViewModel',
      Date: date,
      EmployeeId: employeeId,
      Description: timeEntryGroup.description,
      Duration: timeEntryGroup.time,
    };

    const selectPbiResponse = await fetch(
      `${BASE_URL}/TimeRegistration/PostProductBacklogItemModel`,
      {
        method: 'POST',
        body: new URLSearchParams(postData),
      },
    );

    const newFormContent = await selectPbiResponse.text();
    createFormDiv.innerHTML = newFormContent;

    const saveFormButton = form.querySelector(
      '.saveFormBtn',
    ) as HTMLButtonElement | null;

    if (saveFormButton != null) {
      saveFormButton.click();
      return SAVE_ENTRY_RESULTS.SUCCESS;
    } else {
      console.warn('Save button not found');
      return SAVE_ENTRY_RESULTS.SAVE_BUTTON_NOT_FOUND;
    }
  } catch (error) {
    console.error('Error filling time entry group in content script:', error);
    return SAVE_ENTRY_RESULTS.FAILED;
  }
}

export function getSavedEntriesForDate(date: string): SavedEntry[] | null {
  const dayTab = document.getElementById(`day-tab-${date}`);
  if (!dayTab) {
    return null;
  }

  const entryButtons: NodeListOf<HTMLElement> = dayTab.querySelectorAll(
    '.registration-list-popover',
  );

  return Array.from(entryButtons)
    .map((button) => {
      const description = button.dataset['content'];
      const title = button.dataset['originalTitle'];

      return { description, title };
    })
    .filter(
      (entry) => entry.description != null && entry.title != null,
    ) as SavedEntry[];
}

export function publishSavedEntries() {
  const selectedDate = getSelectedDate();
  if (!selectedDate) {
    return;
  }

  ExtensionMessenger.sendMessageToRuntime({
    type: EXTENSION_MESSAGES.CONTENT_SOURCE.SAVED_ENTRIES_CHANGED,
    savedEntries: getSavedEntriesForDate(selectedDate),
  });
}
