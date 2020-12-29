const defaultSettings = {
  isCounting: true,
  isSoundOnRest: true,
  isSoundOnRestEnd: true,
  visualNotificationType: "popup",
  restTimeInSeconds: 20,
  screenTimeInSeconds: 1200,
  screenTimeLeftInSeconds: 1200,
  restTimeLeftInSeconds: 20,
  startTimeInSeconds: 0,
  pauseStartTimeInSeconds: 0,
  pauseEndTimeInSeconds: 0,
  hasBeenPausedOrPlayed: false,
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
    chrome.alarms.create("alarm", {
      when:
        Date.now() +
        (lookAway ? result.restTimeInSeconds : result.screenTimeInSeconds) *
          1000,
    });
    console.log(
      "notifyToLookAway: " +
        lookAway +
        " New alarm made for " +
        (lookAway ? result.restTimeInSeconds : result.screenTimeInSeconds) *
          1000 +
        " milliseconds from now"
    );
  });
}
function sendMessageToOverlayJs(lookAway) {
  chrome.tabs.query({}, function (tabs = []) {
    tabs.forEach((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        action: lookAway ? "show" : "hide",
      })
    );
    console.log("sent to " + tabs.length + " tab(s)");
  });
}
function createAndClearDesktopNotifications(lookAway) {
  if (lookAway) {
    chrome.notifications.clear("lookBack");
    chrome.notifications.create("lookAway", notificationLookAway);
  } else {
    chrome.notifications.clear("lookAway");
    chrome.notifications.create("lookBack", notificationLookBack);
  }
}
chrome.runtime.onStartup.addListener(resetTimerToDefaults());
chrome.runtime.onInstalled.addListener(resetTimerToDefaults());
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
});

chrome.alarms.onAlarm.addListener(function () {
  createAndClearDesktopNotifications(notifyToLookAway);
  sendMessageToOverlayJs(notifyToLookAway);
  createNewAlarm(notifyToLookAway);
  notifyToLookAway = !notifyToLookAway;
});
