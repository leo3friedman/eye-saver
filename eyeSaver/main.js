const animation = document.querySelector(".toggle-animation");
const notificationsSettingsButton = document.getElementById(
  "notifications-button"
);
const closeNotificationsSettingsButton = document.getElementById(
  "close-notifications-settings-button"
);
const timerSettingsButton = document.getElementById("timer-button");
const closeTimerSettingsButton = document.getElementById(
  "close-adjust-timer-settings-button"
);
const twentyMinRadio = document.getElementById("20-min");
const fortyMinRadio = document.getElementById("40-min");
const sixtyMinRadio = document.getElementById("60-min");
const twentySecRadio = document.getElementById("20-sec");
const fortySecRadio = document.getElementById("40-sec");
const sixtySecRadio = document.getElementById("60-sec");
const overlayNotificationCheckbox = document.getElementById(
  "overlay-notification"
);
const desktopNotificationCheckbox = document.getElementById(
  "desktop-notification"
);
const audioOnRestStartNotificationCheckbox = document.getElementById(
  "sound-on-look-away"
);
const audioOnRestEndNotificationCheckbox = document.getElementById(
  "sound-on-look-back"
);
const defaultSettings = {
  isCounting: true,
  isSoundOnRest: true,
  isSoundOnRestEnd: true,
  isOverlayOnRest: true,
  isDesktopNotificationOnRest: true,
  restTimeInSeconds: 20,
  screenTimeInSeconds: 1200,
  startTimeInSeconds: 0,
  pauseStartTimeInSeconds: 0,
  pauseEndTimeInSeconds: 0,
  hasBeenPausedOrPlayed: false,
  isTimeToRestTheNextNotification: true,
  isTestMode: false,
};
let settings = defaultSettings;

overlayNotificationCheckbox.onclick = () => toggleState("isOverlayOnRest");
desktopNotificationCheckbox.onclick = () =>
  toggleState("isDesktopNotificationOnRest");
audioOnRestStartNotificationCheckbox.onclick = () =>
  toggleState("isSoundOnRest");
audioOnRestEndNotificationCheckbox.onclick = () =>
  toggleState("isSoundOnRestEnd");
twentyMinRadio.onclick = () => setScreenTime(1200);
fortyMinRadio.onclick = () => setScreenTime(2400);
sixtyMinRadio.onclick = () => setScreenTime(3600);
twentySecRadio.onclick = () => setRestTime(20);
fortySecRadio.onclick = () => setRestTime(40);
sixtySecRadio.onclick = () => setRestTime(60);
notificationsSettingsButton.onclick = showNotificationSettings;
closeNotificationsSettingsButton.onclick = hideNotificationSettings;
timerSettingsButton.onclick = showAdjustTimerSettings;
closeTimerSettingsButton.onclick = hideAdjustTimerSettings;

function toggleState(optionKey) {
  chrome.storage.sync.get(defaultSettings, function (result) {
    chrome.storage.sync.set({
      [optionKey]: !result[optionKey],
    });
  });
}
function setRestTime(timeInSeconds) {
  chrome.storage.sync.set({
    restTimeInSeconds: timeInSeconds,
  });
}
function setScreenTime(timeInSeconds) {
  chrome.storage.sync.set({
    screenTimeInSeconds: timeInSeconds,
  });
}
function updatePauseStartTimeInSeconds() {
  //when you click play the first time from opening a browser
  if (settings.isCounting && !settings.hasBeenPausedOrPlayed) {
    settings.startTimeInSeconds = timeNowInSeconds();
    settings.hasBeenPausedOrPlayed = true;
    chrome.storage.sync.set({
      startTimeInSeconds: settings.startTimeInSeconds,
      hasBeenPausedOrPlayed: settings.hasBeenPausedOrPlayed,
    });
  }
  //when you click pause
  else if (!settings.isCounting) {
    (settings.pauseStartTimeInSeconds = timeNowInSeconds()),
      (settings.hasBeenPausedOrPlayed = true),
      chrome.storage.sync.set({
        pauseStartTimeInSeconds: settings.pauseStartTimeInSeconds,
        hasBeenPausedOrPlayed: settings.hasBeenPausedOrPlayed,
      });
  }
  //when you click play and it has been paused before
  else if (settings.isCounting && settings.hasBeenPausedOrPlayed) {
    (settings.startTimeInSeconds =
      settings.startTimeInSeconds +
      (timeNowInSeconds() - settings.pauseStartTimeInSeconds)),
      (settings.hasBeenPausedOrPlayed = true),
      (settings.pauseStartTimeInSeconds = 0),
      chrome.storage.sync.set({
        startTimeInSeconds: settings.startTimeInSeconds,
        hasBeenPausedOrPlayed: settings.hasBeenPausedOrPlayed,
        pauseStartTimeInSeconds: settings.pauseStartTimeInSeconds,
      });
  } else if (settings.isCounting && !settings.hasBeenPausedOrPlayed) {
    chrome.storage.sync.set({ hasBeenPausedOrPlayed: true });
  }
}
function showNotificationSettings() {
  document.body.classList.add("show-notification-settings");
}
function hideNotificationSettings() {
  document.body.classList.remove("show-notification-settings");
}
function showAdjustTimerSettings() {
  document.body.classList.add("show-adjust-timer-settings");
}
function hideAdjustTimerSettings() {
  document.body.classList.remove("show-adjust-timer-settings");
}
function showScreenTimeTimer(storageLocation) {
  const timeRemaining = getTimeRemaining(timeNowInSeconds(), storageLocation);
  if (timeRemaining >= 0) {
    //startStopButton.style.display = "block";
    notificationsSettingsButton.style.display = "block";
    timerSettingsButton.style.display = "block";
    // lookAwayText.style.display = "none";
  } else {
    //startStopButton.style.display = "none";
    notificationsSettingsButton.style.display = "none";
    timerSettingsButton.style.display = "none";
    // lookAwayText.style.display = "block";
  }
}
function renderLoop() {
  eyeSaver.renderClock(document.getElementById("dropzone"), settings);
  showScreenTimeTimer(settings);
  window.requestAnimationFrame(renderLoop);
}

window.requestAnimationFrame(renderLoop);

window.onload = function () {
  console.log(settings.restTimeInSeconds);
  let clockContainer = document.getElementById("dropzone");
  eyeSaver.createClock(clockContainer, {
    onStartStopClicked: () => {
      settings.isCounting = !settings.isCounting;
      console.log("clicked");
      toggleState("isCounting");
      updatePauseStartTimeInSeconds();
    },
    onSkip: () => {
      chrome.runtime.sendMessage({ action: "reset" });
    },
  });
  chrome.storage.sync.get(defaultSettings, function (result) {
    settings = result;

    twentyMinRadio.checked = result.screenTimeInSeconds === 1200;
    fortyMinRadio.checked = result.screenTimeInSeconds === 2400;
    sixtyMinRadio.checked = result.screenTimeInSeconds === 3600;
    twentySecRadio.checked = result.restTimeInSeconds === 20;
    fortySecRadio.checked = result.restTimeInSeconds === 40;
    sixtySecRadio.checked = result.restTimeInSeconds === 60;
    overlayNotificationCheckbox.checked = result.isOverlayOnRest;
    desktopNotificationCheckbox.checked = result.isDesktopNotificationOnRest;
    audioOnRestStartNotificationCheckbox.checked = result.isSoundOnRest;
    audioOnRestEndNotificationCheckbox.checked = result.isSoundOnRestEnd;
    if (result.isTestMode) {
      twentyMinRadio.onclick = () => setScreenTime(8);
    }
  });
};
chrome.storage.onChanged.addListener(function (changes, areaName) {
  console.log(changes);
  if (changes.startTimeInSeconds) {
    settings.startTimeInSeconds = changes.startTimeInSeconds.newValue;
  }
  if (changes.hasBeenPausedOrPlayed) {
    settings.hasBeenPausedOrPlayed = changes.hasBeenPausedOrPlayed.newValue;
  }
  if (changes.isCounting) {
    settings.isCounting = changes.isCounting.newValue;
  }
  if (changes.screenTimeInSeconds) {
    twentyMinRadio.checked = changes.screenTimeInSeconds.newValue === 1200;
    fortyMinRadio.checked = changes.screenTimeInSeconds.newValue === 2400;
    sixtyMinRadio.checked = changes.screenTimeInSeconds.newValue === 3600;
    settings.screenTimeInSeconds = changes.screenTimeInSeconds.newValue;
  }

  if (changes.restTimeInSeconds) {
    twentySecRadio.checked = changes.restTimeInSeconds.newValue === 20;
    fortySecRadio.checked = changes.restTimeInSeconds.newValue === 40;
    sixtySecRadio.checked = changes.restTimeInSeconds.newValue === 60;
    settings.restTimeInSeconds = changes.restTimeInSeconds.newValue;
  }
  if (changes.isSoundOnRest) {
    audioOnRestStartNotificationCheckbox.checked =
      changes.isSoundOnRest.newValue;
    settings.isSoundOnRest = changes.isSoundOnRest.newValue;
  }
  if (changes.isSoundOnRestEnd) {
    audioOnRestEndNotificationCheckbox.checked =
      changes.isSoundOnRestEnd.newValue;
    settings.isSoundOnRestEnd = changes.isSoundOnRestEnd.newValue;
  }
  if (changes.isOverlayOnRest) {
    overlayNotificationCheckbox.checked = changes.isOverlayOnRest.newValue;
  }
  if (changes.isDesktopNotificationOnRest)
    desktopNotificationCheckbox.checked =
      changes.isDesktopNotificationOnRest.newValue;
});