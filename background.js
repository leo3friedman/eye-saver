chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.set({
    startTimeInSeconds: Math.floor(Date.now() / 1000),
    hasBeenPausedOrPlayed: false,
    pauseStartTimeInSeconds: 0,
  });
  chrome.storage.sync.get(defaultSettings, function (result) {
    chrome.alarms.create(
      // ("notificationAlarm", { periodInMinutes: .5 })
      ("notificationAlarm", { periodInMinutes: 1 })
    );
    console.log(result.screenTimeInSeconds);
  });
});
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
chrome.alarms.onAlarm.addListener(function () {});
