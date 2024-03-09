export async function getTimerProperties(defaults) {
  defaults =
    defaults || (await import(chrome.runtime.getURL('enums.js'))).defaults

  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (result) => {
      resolve({
        state: result.state,
        sessionStart: Number(result.sessionStart),
        timerDuration: Number(result.timerDuration),
        restDuration: Number(result.restDuration),
        pushDesktopNotification: result.pushDesktopNotification,
        playSoundNotification: result.playSoundNotification,
      })
    })
  })
}

export async function isExtensionRunning(defaults) {
  defaults =
    defaults || (await import(chrome.runtime.getURL('enums.js'))).defaults

  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (result) => {
      resolve(Number(result.sessionStart) >= 0)
    })
  })
}

export async function setSessionStart(time) {
  if (typeof time !== 'number')
    throw new Error('sessionStart must be a number!')

  chrome.storage.sync.set({ sessionStart: time })
}
