import { defaults, messages, constants } from './enums.js'

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

async function storeCurrentAlarm() {
  const alarm = await chrome.alarms.get(constants.ALARM_NAME)
  chrome.storage.sync.set({ alarm: alarm })
}

/**
 * Clears existing alarms and create and stores a new one
 *
 * @param {number} length - amount of time in ms before alarm should fire
 */
function createNewAlarm(length) {
  chrome.alarms.clearAll(async () => {
    await chrome.alarms.create(constants.ALARM_NAME, {
      when: Date.now() + length,
    })
    await storeCurrentAlarm()
  })
}

function pushNotification() {
  chrome.notifications.create(constants.PUSH_NOTIFICATION)
}

async function playSound() {
  console.log('playing sound...')
  const offscreenExists = await chrome.offscreen.hasDocument()
  console.log('offscreenExists', offscreenExists)
  if (!offscreenExists) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'notification',
    })
  }

  chrome.runtime.sendMessage({
    key: messages.PLAY_SOUND,
    offscreen: true,
    payload: {
      source: constants.soundSource,
      volume: defaults.soundVolume,
    },
  })
}

async function startTimer() {
  chrome.storage.sync.set({ isRunning: true })
  chrome.storage.sync.get(defaults, (result) => {
    const alarmLength = Number(result.timerDuration)
    createNewAlarm(alarmLength)
  })
}

async function stopTimer() {
  chrome.storage.sync.set({ isRunning: false })
  chrome.storage.sync.set({ alarm: null })
  chrome.alarms.clearAll()
}

async function onInstall() {
  const { isRunning, timerDuration } = await getFromStorage(defaults)

  if (!isRunning) return

  const alarmLength = Number(timerDuration)
  createNewAlarm(alarmLength)
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}
async function onAlarm(alarm) {
  console.log('alarm fired...', alarm)

  console.log('current tab', await getCurrentTab())
  chrome.storage.sync.get(defaults, (result) => {
    const {
      isRunning,
      timerDuration,
      restDuration,
      pushDesktopNotification,
      playSoundNotification,
    } = result

    if (!isRunning) return

    const alarmLength = Number(timerDuration) + Number(restDuration)
    createNewAlarm(alarmLength)

    if (pushDesktopNotification) pushNotification()
    if (playSoundNotification) playSound()
  })
}

async function handleMessage(message) {
  // messages for offscreen.js only
  if (message.offscreen) return

  switch (message.key) {
    case messages.START:
      await startTimer()
      break
    case messages.SKIP_REST:
      await startTimer()
      break
    case messages.STOP:
      await stopTimer()
      break

    // CASES USED FOR TESTING ONLY
    case messages.PLAY_SOUND:
      playSound()
      break
    case messages.PUSH_DESKTOP_NOTIFICATION:
      pushNotification()
      break
  }
}
chrome.tabs.onActivated.addListener(() => console.log('new tab'))
chrome.runtime.onInstalled.addListener(onInstall)
chrome.alarms.onAlarm.addListener(onAlarm)
chrome.runtime.onMessage.addListener(handleMessage)
