chrome.storage.sync.get(["showOverlay"], (result) => {
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
    render(changes.showOverlay.newValue);
  }
});
