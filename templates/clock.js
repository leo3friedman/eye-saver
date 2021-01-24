const eyeSaver = {};

eyeSaver.createClock = (clockContainer) => {
  const clockTemplateUrl = chrome.runtime.getURL("templates/clock.html");
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    clockContainer.innerHTML = xhr.response;
  };
  xhr.open("GET", clockTemplateUrl);
  xhr.send();
};
eyeSaver.render = (storageLocation) => {
  const timeRemaining = getTimeRemaining(timeNowInSeconds(), storageLocation);
  //Timer
  if (timeRemaining >= 0) {
    timer.innerText = secondsToDigitalTime(timeRemaining);
  } else if (timeRemaining < 0) {
    timer.innerText = `${Math.floor(Math.abs(timeRemaining))}`;
  }
  //Animated Ring
  if (
    (storageLocation.isCounting && timeRemaining >= 0) ||
    !storageLocation.isCounting
  ) {
    const screenTimeStrokeDashOffset = getStrokeDashOffset(
      storageLocation.screenTimeInSeconds,
      timeRemaining
    );
    showScreenTimeTimer(true);
    animatedRing.style.strokeDashoffset = `${screenTimeStrokeDashOffset}`;
  } else if (storageLocation.isCounting && timeRemaining < 0) {
    const restTimeStrokeDashOffset = getStrokeDashOffset(
      storageLocation.restTimeInSeconds,
      timeRemaining
    );
    showScreenTimeTimer(false);
    animatedRing.style.strokeDashoffset = `${restTimeStrokeDashOffset}`;
  }
};
