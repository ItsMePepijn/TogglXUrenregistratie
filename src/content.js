chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.type === "getSelectedDate")
    sendResponse({ selectedDate: getSelectedDate() });

  return true;
});

document.addEventListener("click", () => {
  publishSelectedDate();
});

function publishSelectedDate() {
  const selectedDate = getSelectedDate();
  console.log("Publishing selected date:", selectedDate);
  if (selectedDate) {
    chrome.runtime.sendMessage({
      type: "selectedDateChanged",
      selectedDate,
    });
  }
}

function getSelectedDate() {
  const form = document.getElementById("createTimeRegistrationForm");
  if (!form) {
    return null;
  }

  const dateInput = form.querySelector("#Date");
  if (!dateInput) {
    return null;
  }

  return dateInput.value.split(" ")[0];
}
