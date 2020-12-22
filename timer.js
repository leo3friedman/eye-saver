function getTimeRemainingInSeconds(nowInSeconds, options) {
  let elapsedTime = nowInSeconds - options.startTimeInSeconds;
  // if (!options.isCounting && !options.hasBeenPausedOrPlayed) {
  //   elapsedTime = 0;
  // }

  const timeRemaining =
    options.screenTimeInSeconds -
    (elapsedTime -
      Math.floor(
        elapsedTime / (options.screenTimeInSeconds + options.restTimeInSeconds)
      ) *
        (options.screenTimeInSeconds + options.restTimeInSeconds));
  return timeRemaining;
}

if (typeof module !== "undefined") {
  module.exports = { getTimeRemainingInSeconds: getTimeRemainingInSeconds };
}
