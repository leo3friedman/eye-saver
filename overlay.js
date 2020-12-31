// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log("received");
//   if (request.action === "show") {
//     document.body.style.opacity = ".5";
//   } else {
//     document.body.style.opacity = "1";
//   }
// });
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
