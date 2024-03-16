const defaults = {
  timerDuration: 20 * 60 * 1000,
  restDuration: 20 * 1000,
  sessionStart: Date.now(),
  pushDesktopNotification: true,
  playSoundNotification: false,
  hasNotifiedLookAway: false,
  hasNotifiedLookBack: false,
  lastLookAway: 0,
  lastLookBack: 0,
}

export async function getTimerProperties() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (result) => {
      resolve({
        sessionStart: Number(result.sessionStart),
        timerDuration: Number(result.timerDuration),
        restDuration: Number(result.restDuration),
        pushDesktopNotification: result.pushDesktopNotification,
        playSoundNotification: result.playSoundNotification,
      })
    })
  })
}

export async function isExtensionRunning() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (result) => {
      resolve(Number(result.sessionStart) >= 0)
    })
  })
}

export async function setSessionStart(time, callback = () => {}) {
  if (typeof time !== 'number')
    throw new Error('sessionStart must be a number!')

  chrome.storage.sync.set({ sessionStart: time }).then(callback)
}

export async function setTimerDuration(duration) {
  if (typeof duration !== 'number' || duration <= 0)
    throw new Error('timerDuration must be a number greater than 0!')

  await chrome.storage.sync.set({ timerDuration: duration })
}
export async function setRestDuration(duration) {
  if (typeof duration !== 'number' || duration <= 0)
    throw new Error('restDuration must be a number greater than 0!')

  await chrome.storage.sync.set({ restDuration: duration })
}
export async function setPushDesktopNotification(boolean) {
  if (typeof boolean !== 'boolean')
    throw new Error('pushDesktopNotification must be a boolean!')

  await chrome.storage.sync.set({ pushDesktopNotification: boolean })
}
export async function setPlaySoundNotification(boolean) {
  if (typeof boolean !== 'boolean')
    throw new Error('playSoundNotification must be a boolean!')

  await chrome.storage.sync.set({ playSoundNotification: boolean })
}

export const storage = {
  getTimerProperties,
  isExtensionRunning,
  setSessionStart,
  setTimerDuration,
  setRestDuration,
  setPushDesktopNotification,
  setPlaySoundNotification,
}
