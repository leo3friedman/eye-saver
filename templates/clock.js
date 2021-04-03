const eyeSaver = {};

function secondsToDigitalTime(timeInSeconds) {
  let minutes = Math.floor(timeInSeconds / 60);
  let minTens = Math.floor(minutes / 10);
  let minOnes = minutes - minTens * 10;
  let secTens =
    Math.floor((timeInSeconds - Math.floor(timeInSeconds / 60) * 60) / 10) % 6;
  let secOnes = Math.floor((timeInSeconds - minutes * 60) % 10);
  return minTens + "" + minOnes + ":" + secTens + "" + secOnes;
}

function getStrokeDashOffset(timerLength, timeRemainingWithDecimal) {
  return 628 * ((timerLength - timeRemainingWithDecimal) / timerLength);
}

eyeSaver.createClock = (clockContainer, { onStartStopClicked }) => {
  const clockTemplateUrl = chrome.runtime.getURL("templates/clock.html");
  console.log(clockTemplateUrl);
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    clockContainer.insertAdjacentHTML("afterbegin", xhr.response);
    const startStopButton = clockContainer.querySelector(
      ".clock__start-stop-timer"
    );
    startStopButton.onclick = onStartStopClicked;
  };
  xhr.open("GET", clockTemplateUrl);
  xhr.send();
};
eyeSaver.renderClock = (clockContainer, options) => {
  const timer = clockContainer.querySelector(".clock__timer");
  const animatedRing = clockContainer.querySelector(".clock__animated-ring");
  const playSvg = clockContainer.querySelector(".clock__play-svg");
  const pauseSvg = clockContainer.querySelector(".clock__pause-svg");
  const startStopButton = clockContainer.querySelector(
    ".clock__start-stop-timer"
  );
  const timeRemaining = getTimeRemaining(timeNowInSeconds(), options);
  if (!timer) {
    return;
  }
  playSvg.style.display = options.isCounting ? "none" : "block";
  pauseSvg.style.display = options.isCounting ? "block" : "none";
  startStopButton.style.display =
    (options.isCounting && timeRemaining >= 0) || !options.isCounting
      ? "block"
      : "none";

  //Timer
  //console.log(timeRemaining);
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
    //showScreenTimeTimer(true);
    animatedRing.style.strokeDashoffset = `${screenTimeStrokeDashOffset}`;
  } else if (options.isCounting && timeRemaining < 0) {
    const restTimeStrokeDashOffset = getStrokeDashOffset(
      options.restTimeInSeconds,
      timeRemaining
    );
    // showScreenTimeTimer(false);
    animatedRing.style.strokeDashoffset = `${restTimeStrokeDashOffset}`;
  }
};
