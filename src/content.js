chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.type === "getSelectedDate")
    sendResponse({ selectedDate: getSelectedDate() });

  return true;
});

function getSelectedDate() {
  const form = document.getElementById("createTimeRegistrationForm");
  if (!form) {
    return null;
  }

  const dateInput = form.querySelector("#Date");
  if (!dateInput) {
    return null;
  }

  return dateInput.value;
}
