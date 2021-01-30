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
eyeSaver.renderClock = (clockContainer, options) => {
  const timer = clockContainer.querySelector(".clock__timer");
  const animatedRing = clockContainer.querySelector(".clock__animated-ring");
  if (!timer) {
    return;
  }
  const timeRemaining = getTimeRemaining(timeNowInSeconds(), options);
  //Timer
  if (timeRemaining >= 0) {
    timer.innerText = secondsToDigitalTime(timeRemaining);
  } else if (timeRemaining < 0) {
    timer.innerText = `${Math.floor(Math.abs(timeRemaining))}`;
  }
  //Animated Ring
  if ((options.isCounting && timeRemaining >= 0) || !options.isCounting) {
    const screenTimeStrokeDashOffset = getStrokeDashOffset(
      options.screenTimeInSeconds,
      timeRemaining
    );
    showScreenTimeTimer(true);
    animatedRing.style.strokeDashoffset = `${screenTimeStrokeDashOffset}`;
  } else if (options.isCounting && timeRemaining < 0) {
    const restTimeStrokeDashOffset = getStrokeDashOffset(
      options.restTimeInSeconds,
      timeRemaining
    );
    showScreenTimeTimer(false);
    animatedRing.style.strokeDashoffset = `${restTimeStrokeDashOffset}`;
  }
};
