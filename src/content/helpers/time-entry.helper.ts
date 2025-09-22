import { EXTENSION_MESSAGES } from '../../core/constants/messages.constant';
import { ExtensionMessenger } from '../../core/helpers/extension-messager.helper';
import { FillTimeEntryRequestPayload } from '../../core/models/messages/fill-time-entry-request.model';
import { SavedEntry } from '../../core/models/saved-entry.model';
import { BASE_URL } from '../constants/base-url.constant';
import { ELEMENT_SELECTORS } from '../constants/element-selectors.constant';
import { getSelectedDate } from './date.helper';

export async function fillTimeEntryGroup(
  timeEntryGroup: FillTimeEntryRequestPayload,
) {
  const form = document.getElementById(ELEMENT_SELECTORS.FORM_SELECTION_ID);
  if (!form) {
    console.warn('Form not found');
    return;
  }

  const dateInput = form.querySelector('#Date') as HTMLInputElement | null;
  if (!dateInput) {
    console.warn('Date input not found');
    return;
  }
  const date = dateInput.value;

  const employeeIdInput = form.querySelector(
    '#EmployeeId',
  ) as HTMLInputElement | null;
  if (!employeeIdInput) {
    console.warn('EmployeeId input not found');
    return;
  }
  const employeeId = employeeIdInput.value;

  const createFormDiv = form.querySelector('#create-form');
  if (!createFormDiv) {
    console.warn('Create form div not found');
    return;
  }

  const resp = await fetch(
    `${BASE_URL}/Client/ListActive?page=1&SearchTerm=%23${timeEntryGroup.pbi}`,
  );
  const body = await resp.json();
  const firstItem = body[0].children[0];

  const verifyDescriptionRegex = new RegExp(`#${timeEntryGroup.pbi} -`);
  if (!firstItem || !verifyDescriptionRegex.test(firstItem.text)) {
    console.warn('Description verification failed');
    return;
  }

  const postData = {
    ProductBacklogItemId: firstItem.id.replace('#', ''),
    ViewModelName: 'CreateTimeRegistrationViewModel',
    Date: date,
    EmployeeId: employeeId,
    Description: timeEntryGroup.description,
    Duration: timeEntryGroup.time,
  };

  const postResp = await fetch(
    `${BASE_URL}/TimeRegistration/PostProductBacklogItemModel`,
    {
      method: 'POST',
      body: new URLSearchParams(postData),
    },
  );

  const newFormContent = await postResp.text();
  createFormDiv.innerHTML = newFormContent;

  const saveFormButton = form.querySelector(
    '.saveFormBtn',
  ) as HTMLButtonElement | null;

  if (saveFormButton) {
    saveFormButton.click();
  } else {
    console.warn('Save button not found');
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
