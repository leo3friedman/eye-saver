const timer = document.getElementById("timer");
const lookAwayText = document.getElementById("look-away-text");
const animation = document.querySelector(".toggle-animation");
const startStopButton = document.getElementById("start-stop-timer");
const animatedRing = document.getElementById("animated-ring");
const playSvg = document.getElementById("play-svg");
const pauseSvg = document.getElementById("pause-svg");
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
const overlayNotificationRadio = document.getElementById(
  "overlay-notification"
);
const popupNotificationRadio = document.getElementById("popup-notification");
const desktopNotificationRadio = document.getElementById(
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
let settings = defaultSettings;

startStopButton.onclick = () => {
  settings.isCounting = !settings.isCounting;
  toggleState("isCounting");
  renderPlayButton(settings.isCounting);
  updatePauseStartTimeInSeconds();
};
audioOnRestStartNotificationCheckbox.onclick = () =>
  toggleState("isSoundOnRest");
audioOnRestEndNotificationCheckbox.onclick = () =>
  toggleState("isSoundOnRestEnd");
twentyMinRadio.onclick = () => setScreenTime(1200);
// fortyMinRadio.onclick = () => setScreenTime(2400);
fortyMinRadio.onclick = () => setScreenTime(30);
sixtyMinRadio.onclick = () => setScreenTime(3600);
twentySecRadio.onclick = () => setRestTime(20);
fortySecRadio.onclick = () => setRestTime(40);
sixtySecRadio.onclick = () => setRestTime(60);
overlayNotificationRadio.onclick = () => setVisualNotificationType("overlay");
popupNotificationRadio.onclick = () => setVisualNotificationType("popup");
desktopNotificationRadio.onclick = () => setVisualNotificationType("desktop");
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
function setVisualNotificationType(notificationType) {
  chrome.storage.sync.set({
    visualNotificationType: notificationType,
  });
}
function updatePauseStartTimeInSeconds() {
  //when you click play the first time from opening a browser
  if (settings.isCounting && !settings.hasBeenPausedOrPlayed) {
    settings.startTimeInSeconds = Math.floor(Date.now() / 1000);
    settings.hasBeenPausedOrPlayed = true;
    chrome.storage.sync.set({
      startTimeInSeconds: settings.startTimeInSeconds,
      hasBeenPausedOrPlayed: settings.hasBeenPausedOrPlayed,
    });
  }
  //when you click pause
  else if (!settings.isCounting) {
    (settings.pauseStartTimeInSeconds = Math.floor(Date.now() / 1000)),
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
      (Math.floor(Date.now() / 1000) - settings.pauseStartTimeInSeconds)),
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
function renderPlayButton(val) {
  if (val) {
    playSvg.style.display = "none";
    pauseSvg.style.display = "block";
  } else if (!val) {
    playSvg.style.display = "block";
    pauseSvg.style.display = "none";
  }
}
function secondsToDigitalTime(timeInSeconds) {
  let minutes = Math.floor(timeInSeconds / 60);
  let minTens = Math.floor(minutes / 10);
  let minOnes = minutes - minTens * 10;
  let secTens =
    Math.floor((timeInSeconds - Math.floor(timeInSeconds / 60) * 60) / 10) % 6;
  let secOnes = (timeInSeconds - minutes * 60) % 10;
  return minTens + "" + minOnes + ":" + secTens + "" + secOnes;
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
function getTimeRemainingInSeconds(nowInSeconds, options) {
  let elapsedTime = nowInSeconds - options.startTimeInSeconds;
  // if its paused and the first browser instance
  if (!options.isCounting && !options.hasBeenPausedOrPlayed) {
    elapsedTime = 0;
  } else if (!options.isCounting) {
    elapsedTime = options.pauseStartTimeInSeconds - options.startTimeInSeconds;
  }

  const timeRemaining =
    options.screenTimeInSeconds -
    (elapsedTime -
      Math.floor(
        elapsedTime / (options.screenTimeInSeconds + options.restTimeInSeconds)
      ) *
        (options.screenTimeInSeconds + options.restTimeInSeconds));
  return timeRemaining;
}
function getTimeRemainingInSecondsWithDecimal(nowInMilliseconds, options) {
  let elapsedTime = nowInMilliseconds - options.startTimeInSeconds;
  // if its paused and the first browser instance
  if (!options.isCounting && !options.hasBeenPausedOrPlayed) {
    elapsedTime = 0;
  } else if (!options.isCounting) {
    elapsedTime = options.pauseStartTimeInSeconds - options.startTimeInSeconds;
  }

  const timeRemaining =
    options.screenTimeInSeconds -
    (elapsedTime -
      Math.floor(
        elapsedTime / (options.screenTimeInSeconds + options.restTimeInSeconds)
      ) *
        (options.screenTimeInSeconds + options.restTimeInSeconds));
  return timeRemaining;
}
function getStrokeDashOffset(timerLength, timeRemainingWithDecimal) {
  return 628 * ((timerLength - timeRemainingWithDecimal) / timerLength);
}

let timeNowInSeconds = () => Math.floor(Date.now() / 1000);

window.onload = function () {
  chrome.storage.sync.get(defaultSettings, function (result) {
    settings = result;
    renderPlayButton(result.isCounting);

    const timeRemaining = getTimeRemainingInSeconds(timeNowInSeconds(), result);
    timer.innerText = secondsToDigitalTime(timeRemaining);

    const timeRemainingInSecondsWithDecimal = getTimeRemainingInSecondsWithDecimal(
      Date.now() / 1000,
      result
    );

    if ((settings.isCounting && timeRemaining >= 0) || !settings.isCounting) {
      const screenTimeStrokeDashOffset = getStrokeDashOffset(
        settings.screenTimeInSeconds,
        timeRemainingInSecondsWithDecimal
      );
      showScreenTimeTimer(true);
      animatedRing.style.strokeDashoffset = `${screenTimeStrokeDashOffset}`;
    } else if (settings.isCounting && timeRemaining < 0) {
      const restTimeStrokeDashOffset = getStrokeDashOffset(
        settings.restTimeInSeconds,
        timeRemainingInSecondsWithDecimal
      );
      showScreenTimeTimer(false);
      animatedRing.style.strokeDashoffset = `${restTimeStrokeDashOffset}`;
    }

    twentyMinRadio.checked = result.screenTimeInSeconds === 1200;
    fortyMinRadio.checked = result.screenTimeInSeconds === 2400;
    sixtyMinRadio.checked = result.screenTimeInSeconds === 3600;

    twentySecRadio.checked = result.restTimeInSeconds === 20;
    fortySecRadio.checked = result.restTimeInSeconds === 40;
    sixtySecRadio.checked = result.restTimeInSeconds === 60;

    overlayNotificationRadio.checked =
      result.visualNotificationType === "overlay";
    popupNotificationRadio.checked = result.visualNotificationType === "popup";
    desktopNotificationRadio.checked =
      result.visualNotificationType === "desktop";

    audioOnRestStartNotificationCheckbox.checked = result.isSoundOnRest;
    audioOnRestEndNotificationCheckbox.checked = result.isSoundOnRestEnd;
  });
};
function millisecondsToSeconds(milliseconds) {
  return Math.floor(milliseconds / 1000);
}

function updateEveryHundredthSecond() {
  const timeRemaining = getTimeRemainingInSeconds(
    millisecondsToSeconds(Date.now()),
    settings
  );
  if (timeRemaining >= 0) {
    timer.innerText = secondsToDigitalTime(timeRemaining);
  } else if (timeRemaining < 0) {
    timer.innerText = `${Math.abs(timeRemaining)}`;
  }
  const timeRemainingInSecondsWithDecimal = getTimeRemainingInSecondsWithDecimal(
    Date.now() / 1000,
    settings
  );
  if (settings.isCounting && timeRemaining >= 0) {
    const screenTimeStrokeDashOffset = getStrokeDashOffset(
      settings.screenTimeInSeconds,
      timeRemainingInSecondsWithDecimal
    );
    showScreenTimeTimer(true);
    animatedRing.style.strokeDashoffset = `${screenTimeStrokeDashOffset}`;
  } else if (settings.isCounting && timeRemaining < 0) {
    const restTimeStrokeDashOffset = getStrokeDashOffset(
      settings.restTimeInSeconds,
      timeRemainingInSecondsWithDecimal
    );
    showScreenTimeTimer(false);
    animatedRing.style.strokeDashoffset = `${restTimeStrokeDashOffset}`;
  }
}
function showScreenTimeTimer(val) {
  if (val) {
    startStopButton.style.display = "block";
    notificationsSettingsButton.style.display = "block";
    timerSettingsButton.style.display = "block";
    lookAwayText.style.display = "none";
  } else {
    startStopButton.style.display = "none";
    notificationsSettingsButton.style.display = "none";
    timerSettingsButton.style.display = "none";
    lookAwayText.style.display = "block";
  }
}
setInterval(updateEveryHundredthSecond, 10);
chrome.storage.onChanged.addListener(function (changes, areaName) {
  return;
  console.log(changes);
  if (changes.startTimeInSeconds) {
    settings.startTimeInSeconds = changes.startTimeInSeconds.newValue;
  }
  if (changes.hasBeenPausedOrPlayed) {
    settings.hasBeenPausedOrPlayed = changes.hasBeenPausedOrPlayed.newValue;
  }
  if (changes.isCounting) {
    renderPlayButton(changes.isCounting.newValue);
    settings.isCounting = changes.isCounting.newValue;
  }
  if (changes.screenTimeInSeconds) {
    twentyMinRadio.checked = changes.screenTimeInSeconds.newValue === 1200;
    fortyMinRadio.checked = changes.screenTimeInSeconds.newValue === 2400;
    sixtyMinRadio.checked = changes.screenTimeInSeconds.newValue === 3600;
    settings.screenTimeInSeconds = changes.screenTimeInSeconds.newValue;
  }
  if (changes.screenTimeLeftInSeconds) {
    timer.textContent = secondsToDigitalTime(
      changes.screenTimeLeftInSeconds.newValue
    );
    settings.screenTimeLeftInSeconds = changes.screenTimeLeftInSeconds.newValue;
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
});
