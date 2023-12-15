export const states = {
  PAUSED: 0,
  RUNNING: 1,
}

export const modes = {
  BREAK_TIME: 0,
  SCREEN_TIME: 1,
}

export const messages = {
  INITIATE_REST: 0,
  INITIATE_REST_RECIEVED: 1,
  INITIATE_REST_END: 2,
}

export const defaults = {
  timerDuration: 10000,
  restDuration: 5000,
  state: states.RUNNING,
  mode: modes.SCREEN_TIME,
}
