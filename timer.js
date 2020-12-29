function getTimeRemaining(nowInSeconds, options) {
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
let timeNowInSeconds = () => Date.now() / 1000;

if (typeof module !== "undefined") {
  module.exports = { getTimeRemaining: getTimeRemaining };
}
