export const states = {
  RUNNING: 0,
  STOPPED: 1,
}

export const modes = {
  BREAK_TIME: 0,
  SCREEN_TIME: 1,
}

export const messages = {
  INITIATE_REST: 0,
  INITIATE_REST_RECIEVED: 1,
  INITIATE_REST_END: 2,
  RESTART_POPUP_TIMER: 3,
  START_EXTENSION: 4,
  STOP_EXTENSION: 5,
  RESTING: 6,
  ACTIVATE: 7,
  PUSH_DESKTOP_NOTIFICATION: 8,
  PLAY_SOUND: 9,
  SKIP_REST: 10,
}

export const defaults = {
  timerDuration: 20 * 60 * 1000,
  restDuration: 20 * 1000,
  state: states.RUNNING,
  mode: modes.SCREEN_TIME,
  sessionStart: Date.now(),
  pushDesktopNotification: true,
  playSoundNotification: true,
  hasNotifiedLookAway: false,
  hasNotifiedLookBack: false,
  soundSource: 'sounds/look_back_sound.wav',
  soundVolume: 0.5,
  lastLookAway: 0,
  lastLookBack: 0,
}

export const notificationOptions = {
  title: 'Eye Saver',
  type: 'basic',
  iconUrl: 'assets/64icon.png',
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

export const alarms = {
  REST_ON_ALARM: 'restAlarm',
}
