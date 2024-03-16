export const states = {
  RUNNING: 0,
  STOPPED: 1,
}

export const modes = {
  BREAK_TIME: 0,
  SCREEN_TIME: 1,
}

export const messages = {
  START_EXTENSION: 0,
  STOP_EXTENSION: 1,
  PLAY_SOUND: 2,
  SKIP_REST: 3,
}

export const defaults = {
  timerDuration: 20 * 60 * 1000,
  restDuration: 20 * 1000,
  state: states.RUNNING,
  mode: modes.SCREEN_TIME,
  sessionStart: Date.now(),
  pushDesktopNotification: true,
  playSoundNotification: false,
  hasNotifiedLookAway: false,
  hasNotifiedLookBack: false,
  soundSource: '../sounds/sound-notification.wav',
  soundVolume: 0.5,
  lastLookAway: 0,
  lastLookBack: 0,
}

export const notificationOptions = {
  title: 'Eye Saver',
  type: 'basic',
  iconUrl: '../images/icon-64.png',
  lookAwayMessage: 'Look away from the screen!',
  lookBackMessage: 'Rest time over!',
}

export const timerInputDefaults = {
  timerDurationIncrement: 10 * 60 * 1000,
  restDurationIncrement: 10 * 1000,
  maxTimerDuration: 2 * 60 * 60 * 1000,
  minTimerDuration: 10 * 60 * 1000,
  maxRestDuration: 2 * 60 * 1000,
  minRestDuration: 10 * 1000,
}
