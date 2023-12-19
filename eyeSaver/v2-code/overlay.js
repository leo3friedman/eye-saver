let settings = {};
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
  showOverlay: false,
};

chrome.storage.sync.get(defaultSettings, (result) => {
  settings = result;
  render(result.showOverlay);
});

function render(showOverlay) {
  if (showOverlay) {
    document.body.classList.add("res-show-overlay");
  } else {
    document.body.classList.remove("res-show-overlay");
  }
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (changes.showOverlay) {
    console.log(settings.isCounting);
    render(changes.showOverlay.newValue);
  }
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
    settings.screenTimeInSeconds = changes.screenTimeInSeconds.newValue;
  }

  if (changes.restTimeInSeconds) {
    settings.restTimeInSeconds = changes.restTimeInSeconds.newValue;
  }
});

function renderLoop() {
  let elementById = document.getElementById("es-overlay");
  eyeSaver.renderClock(elementById, {
    ...settings,
    shouldHideScreenTimeTimer: true,
  });
  window.requestAnimationFrame(renderLoop);
}

window.onload = () => {
  //
  chrome.storage.sync.get(defaultSettings, (result) => {
    console.log("result : " + result);
    console.log("result.showOverlay : " + result.showOverlay);
    render(result.showOverlay);
  });
  //
  const overlay = document.createElement("div");
  overlay.id = "es-overlay";
  document.body.appendChild(overlay);
  eyeSaver.createClock(overlay, {
    onSkip: () => {
      chrome.runtime.sendMessage({ action: "reset" });
    },
  });
  window.requestAnimationFrame(renderLoop);
};