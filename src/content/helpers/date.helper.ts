import { EXTENSION_MESSAGES } from '../../core/constants/messages.constant';
import { ExtensionMessenger } from '../../core/helpers/extension-messager.helper';
import { ELEMENT_SELECTORS } from '../constants/element-selectors.constant';

export function publishSelectedDate() {
  const selectedDate = getSelectedDate();

  if (selectedDate) {
    ExtensionMessenger.sendMessageToRuntime({
      type: EXTENSION_MESSAGES.CONTENT_SOURCE.SELECTED_DATE_CHANGED,
      selectedDate,
    });
  }
}

export function getSelectedDate() {
  const form = document.getElementById(ELEMENT_SELECTORS.FORM_SELECTION_ID);
  if (!form) {
    return null;
  }

  const dateInput = form.querySelector('#Date') as HTMLInputElement | null;
  if (!dateInput) {
    return null;
  }

  return dateInput.value.split(' ')[0];
}
