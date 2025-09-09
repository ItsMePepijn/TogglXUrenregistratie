import { EXTENSION_MESSAGES } from '../core/constants/messages.constant';
import { MessageBase } from '../core/models/message-base.model';
import { ExtensionMessenger } from '../core/services/extension-messager';

const FORM_SELECTION_ID = 'createTimeRegistrationForm';
const BASE_URL = window.location.origin;

ExtensionMessenger.startListeningToMsg(
  EXTENSION_MESSAGES.POPUP_SOURCE.GET_SELECTED_DATE,
  (_, sendResponse) => {
    sendResponse(getSelectedDate());
  },
);

ExtensionMessenger.startListeningToMsg<{ payload: any } & MessageBase>(
  EXTENSION_MESSAGES.POPUP_SOURCE.FILL_TIME_ENTRY,
  async (message) => {
    await fillTimeEntryGroup(message.payload);
  },
);

document.addEventListener('click', () => {
  publishSelectedDate();
});

function publishSelectedDate() {
  const selectedDate = getSelectedDate();

  if (selectedDate) {
    ExtensionMessenger.sendMessageToRuntime({
      type: EXTENSION_MESSAGES.CONTENT_SOURCE.SELECTED_DATE_CHANGED,
      selectedDate,
    });
  }
}

function getSelectedDate() {
  const form = document.getElementById(FORM_SELECTION_ID);
  if (!form) {
    return null;
  }

  const dateInput = form.querySelector('#Date') as HTMLInputElement | null;
  if (!dateInput) {
    return null;
  }

  return dateInput.value.split(' ')[0];
}

async function fillTimeEntryGroup(timeEntryGroup: any) {
  if (
    !timeEntryGroup?.pbiNumber ||
    !timeEntryGroup?.description ||
    !timeEntryGroup?.time
  ) {
    console.warn('Incomplete time entry group:', timeEntryGroup);
    return;
  }

  const form = document.getElementById(FORM_SELECTION_ID);
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

  const createFormDiv = form.querySelector('#create-form');
  if (!createFormDiv) {
    console.warn('Create form div not found');
    return;
  }

  const resp = await fetch(
    `${BASE_URL}/Client/ListActive?page=1&SearchTerm=%23${timeEntryGroup.pbiNumber}`,
  );
  const body = await resp.json();
  const firstItem = body[0].children[0];

  const verifyDescriptionRegex = new RegExp(`#${timeEntryGroup.pbiNumber} -`);
  if (!firstItem || !verifyDescriptionRegex.test(firstItem.text)) {
    console.warn('Description verification failed');
    return;
  }

  const postData = {
    ProductBacklogItemId: firstItem.id.replace('#', ''),
    ViewModelName: 'CreateTimeRegistrationViewModel',
    Date: date,
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
}
