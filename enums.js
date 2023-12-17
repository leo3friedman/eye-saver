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
}

export const defaults = {
  timerDuration: 10000,
  restDuration: 5000,
  state: states.RUNNING,
  mode: modes.SCREEN_TIME,
}

export const alarms = {
  REST_ON_ALARM: 'restAlarm',
}
