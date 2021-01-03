const defaultSettings = {
  isCounting: true,
  isSoundOnRest: true,
  isSoundOnRestEnd: true,
  isOverlayOnRest: false,
  isDesktopNotificationOnRest: true,
  restTimeInSeconds: 20,
  screenTimeInSeconds: 1200,
  startTimeInSeconds: 0,
  pauseStartTimeInSeconds: 0,
  pauseEndTimeInSeconds: 0,
  hasBeenPausedOrPlayed: false,
  showOverlay: false,
};
const notificationLookAway = {
  type: "basic",
  title: "Eye Strain Relief",
  message: "Time to look away from the screen",
  iconUrl: "IMGs/64icon.png",
};
const notificationLookBack = {
  type: "basic",
  title: "Eye Strain Relief",
  message: "Time to look back at the screen",
  iconUrl: "IMGs/64icon.png",
};
let notifyToLookAway = true;

function resetTimerToDefaults() {
  chrome.notifications.clear("lookBack");
  chrome.notifications.clear("lookAway");
  notifyToLookAway = true;
  chrome.storage.sync.set({
    startTimeInSeconds: Math.floor(Date.now() / 1000),
    hasBeenPausedOrPlayed: false,
    pauseStartTimeInSeconds: 0,
  });
  chrome.storage.sync.get(defaultSettings, function (result) {
    //if it is counting on startup, set alarm for screenTimeInSeconds
    if (result.isCounting) {
      chrome.alarms.create("alarm", {
        when: Date.now() + getTimeRemaining(timeNowInSeconds(), result) * 1000,
      });
    }
  });
}
function createNewAlarm(lookAway) {
  chrome.storage.sync.get(defaultSettings, function (result) {
    const timeRemaining = getTimeRemaining(timeNowInSeconds(), result);
    chrome.alarms.create("alarm", {
      when:
        Date.now() +
        (lookAway
          ? result.restTimeInSeconds - Math.abs(timeRemaining)
          : timeRemaining) *
          1000,
    });
    console.log(
      "notifyToLookAway: " +
        lookAway +
        " New alarm made for " +
        (lookAway
          ? result.restTimeInSeconds - Math.abs(timeRemaining)
          : timeRemaining) *
          1000 +
        " milliseconds from now"
    );
  });
}
function sendMessageToOverlayJs(lookAway) {
  chrome.storage.sync.get(defaultSettings, (result) => {
    console.log("lookAway: " + lookAway);
    console.log("isOverlayOnRest: " + result.isOverlayOnRest);
    if (result.isOverlayOnRest) {
      chrome.storage.sync.set({
        showOverlay: lookAway,
      });
    }
  });
}
function createAndClearDesktopNotifications(lookAway) {
  chrome.storage.sync.get(defaultSettings, (result) => {
    if (result.isDesktopNotificationOnRest) {
      if (lookAway) {
        chrome.notifications.clear("lookBack");
        chrome.notifications.create("lookAway", notificationLookAway);
      } else {
        chrome.notifications.clear("lookAway");
        chrome.notifications.create("lookBack", notificationLookBack);
      }
    }
  });
  // if (lookAway) {
  //   chrome.notifications.clear("lookBack");
  //   chrome.notifications.create("lookAway", notificationLookAway);
  // } else {
  //   chrome.notifications.clear("lookAway");
  //   chrome.notifications.create("lookBack", notificationLookBack);
  // }
}

chrome.runtime.onStartup.addListener(resetTimerToDefaults);
chrome.runtime.onInstalled.addListener(resetTimerToDefaults);
chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (changes.isCounting) {
    if (changes.isCounting.newValue) {
      chrome.storage.sync.get(defaultSettings, function (result) {
        chrome.alarms.create("alarm", {
          when:
            Date.now() + getTimeRemaining(timeNowInSeconds(), result) * 1000,
        });
        console.log(getTimeRemaining(timeNowInSeconds(), result) * 1000);
      });
      console.log("making new alarm after play");
    } else if (!changes.isCounting.newValue) {
      chrome.alarms.clearAll();
      console.log("alarm cleared after pause");
    }
  }
  if (changes.screenTimeInSeconds) {
    chrome.alarms.clearAll();
    resetTimerToDefaults();
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reset") {
    resetTimerToDefaults();
  }
});

chrome.alarms.onAlarm.addListener(function () {
  sendMessageToOverlayJs(notifyToLookAway);
  createAndClearDesktopNotifications(notifyToLookAway);
  createNewAlarm(notifyToLookAway);
  notifyToLookAway = !notifyToLookAway;
});
