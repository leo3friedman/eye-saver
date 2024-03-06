export async function getTimerProperties(defaults) {
  defaults = defaults || (await import(chrome.runtime.getURL('enums.js')))

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

export async function setSessionStart(time) {
  if (typeof time !== 'number' || time < 0)
    throw new Error('sessionStart must be a positive number!')

  chrome.storage.sync.set({ sessionStart: time })
}
