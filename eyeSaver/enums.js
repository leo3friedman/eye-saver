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
  INITIATE_START: 4,
  INITIATE_CANCEL: 5,
  RESTING: 6,
  ACTIVATE: 7,
  PUSH_DESKTOP_NOTIFICATION: 8,
  PLAY_SOUND: 9,
}

export const defaults = {
  timerDuration: 10000,
  restDuration: 5000,
  state: states.RUNNING,
  mode: modes.SCREEN_TIME,
  sessionStart: Date.now(),
  pushDesktopNotification: true,
  playSoundNotification: true,
  soundSource: 'sounds/look_back_sound.wav',
  soundVolume: 0.5,
}

export const notificationOptions = {
  title: 'Eye Saver',
  type: 'basic',
  iconUrl: 'IMGs/64icon.png',
  lookAwayMessage: 'Look away from the screen!',
  lookBackMessage: 'Rest time over!',
}

export const alarms = {
  REST_ON_ALARM: 'restAlarm',
}
