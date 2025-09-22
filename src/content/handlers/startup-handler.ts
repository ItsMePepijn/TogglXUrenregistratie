import { EXTENSION_MESSAGES } from '../../core/constants/messages.constant';
import { ExtensionMessenger } from '../../core/helpers/extension-messager.helper';
import { FillTimeEntryRequest } from '../../core/models/messages/fill-time-entry-request.model';
import { GetSavedEntriesRequest } from '../../core/models/messages/get-saved-entries-request.model';
import { getSelectedDate, publishSelectedDate } from '../helpers/date.helper';
import {
  fillTimeEntryGroup,
  getSavedEntriesForDate,
  publishSavedEntries,
} from '../helpers/time-entry.helper';

export function startupHandler() {
  ExtensionMessenger.startListeningToMsg(
    EXTENSION_MESSAGES.POPUP_SOURCE.GET_SELECTED_DATE,
    (_, sendResponse) => {
      sendResponse(getSelectedDate());
    },
  );

  ExtensionMessenger.startListeningToMsg<FillTimeEntryRequest>(
    EXTENSION_MESSAGES.POPUP_SOURCE.FILL_TIME_ENTRY,
    async (message) => {
      await fillTimeEntryGroup(message.payload);
    },
  );

  ExtensionMessenger.startListeningToMsg<GetSavedEntriesRequest>(
    EXTENSION_MESSAGES.POPUP_SOURCE.GET_SAVED_ENTRIES,
    (message, sendResponse) => {
      sendResponse(getSavedEntriesForDate(message.payload.date));
    },
  );

  document.addEventListener('click', () => {
    publishSelectedDate();
  });

  publishSavedEntries();
}
