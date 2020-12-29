chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("received");
  if (request.action === "show") {
    document.body.style.opacity = ".5";
  } else {
    document.body.style.opacity = "1";
  }
});
