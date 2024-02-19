import { defaults, states, messages, constants } from './enums.js'

async function getFromStorage(defaults, keys = null) {
  const requestedDefaults = keys
    ? Object.fromEntries(
        Object.entries(defaults).filter(([key]) => keys.includes(key))
      )
    : defaults

  return new Promise((resolve) => {
    chrome.storage.sync.get(requestedDefaults, (result) => {
      resolve(result)
    })
  })
}

/**
 *
 * @param {Number} time time to set restStart in ms from the epoch
 */
function setRestStart(time) {
  chrome.storage.sync.set({ restStart: time })
}

/**
 * Clears existing alarms and creates a new one
 *
 * @param {number} length - amount of time in ms before alarm should fire
 */
function createNewAlarm(length) {
  // console.log(`creating new alarm of length: ${length / 1000}`)
  chrome.alarms.clearAll(async () => {
    await chrome.alarms.create(constants.ALARM_NAME, {
      when: Date.now() + length,
    })
    const newAlarm = await chrome.alarms.get(constants.ALARM_NAME)
    chrome.storage.sync.set({ alarm: newAlarm })
  })
}

function pushNotification() {
  // console.log('push desktop notification!')
}

function playSound() {
  // console.log('play sound!')
}

async function onAlarm(alarm) {
  // console.log('alarm fired...', alarm)

  chrome.storage.sync.get(defaults, (result) => {
    const {
      isRunning,
      timerDuration,
      restDuration,
      pushDesktopNotification,
      playSoundNotification,
    } = result

    if (!isRunning) return

    setRestStart(Date.now())

    const alarmLength = Number(timerDuration) + Number(restDuration)
    createNewAlarm(alarmLength)

    if (pushDesktopNotification) pushNotification()
    if (playSoundNotification) playSound()
  })
}

async function onInstall() {
  const { isRunning, timerDuration } = await getFromStorage(defaults)

  if (!isRunning) return

  const alarmLength = Number(timerDuration)
  createNewAlarm(alarmLength)
}

async function createOffscreen() {
  const offscreenExists = await chrome.offscreen.hasDocument()
  if (!offscreenExists) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'notification',
    })
  }
}

chrome.runtime.onInstalled.addListener(onInstall)
chrome.alarms.onAlarm.addListener(onAlarm)

// PRE-MIGRATION CODE

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.key === messages.PUSH_DESKTOP_NOTIFICATION) {
    chrome.notifications.create(message.payload)
  }

  if (message.key === messages.PLAY_SOUND && !message.offscreen) {
    await createOffscreen()
    message.offscreen = true
    await chrome.runtime.sendMessage(message)
  }

  if (message.key === messages.START) {
    chrome.storage.sync.set({ isRunning: true })
    chrome.storage.sync.get(defaults, (result) => {
      const alarmLength = Number(result.timerDuration)
      createNewAlarm(alarmLength)
    })
  }

  if (message.key === messages.STOP) {
    chrome.storage.sync.set({ isRunning: false })
    chrome.storage.sync.set({ alarm: null })
    chrome.alarms.clearAll()
  }
})
