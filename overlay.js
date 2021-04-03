let settings = {};

chrome.storage.sync.get(
  [
    "showOverlay",
    "isCounting",
    "restTimeInSeconds",
    "screenTimeInSeconds",
    "startTimeInSeconds",
    "pauseStartTimeInSeconds",
    "pauseEndTimeInSeconds",
    "hasBeenPausedOrPlayed",
    "isTimeToRestTheNextNotification",
  ],
  (result) => {
    settings = result;
    render(result.showOverlay);
  }
);

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
  console.log(settings);
  let elementById = document.getElementById("dropzone");
  eyeSaver.renderClock(elementById, settings);
  window.requestAnimationFrame(renderLoop);
}

window.onload = () => {
  const spotToDropClock = document.createElement("div");
  spotToDropClock.id = "dropzone";
  document.body.appendChild(spotToDropClock);
  eyeSaver.createClock(spotToDropClock, {});
  window.requestAnimationFrame(renderLoop);
};
