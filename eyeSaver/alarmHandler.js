import enums, { defaults, messages, constants, receivers } from './enums.js'
import { StorageManager } from './storageManager.js'

const storage = new StorageManager(chrome, false, enums)

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
    const alarm = await chrome.alarms.get(constants.ALARM_NAME)
    storage.setAlarm(alarm)
  })
}

async function showOverlay(tabId, totalRestDuration, restDurationRemaining) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      key: messages.SHOW_OVERLAY,
      receiver: receivers.OVERLAY,
      payload: {
        totalRestDuration,
        restDurationRemaining,
      },
    })
  } catch (err) {}
}

function showAllOverlay(totalRestDuration, restDurationRemaining) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) =>
      showOverlay(tab.id, totalRestDuration, restDurationRemaining)
    )
  })
}

async function removeOverlay(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      key: messages.REMOVE_OVERLAY,
      receiver: receivers.OVERLAY,
    })
  } catch (err) {}
}

function removeAllOverlay() {
  chrome.tabs.query({}, (tabs) => tabs.forEach((tab) => removeOverlay(tab.id)))
}

function pushNotification() {
  chrome.notifications.create(constants.PUSH_NOTIFICATION)
}

async function playSound() {
  const offscreenExists = await chrome.offscreen.hasDocument()
  if (!offscreenExists) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'notification',
    })
  }
  try {
    chrome.runtime.sendMessage({
      key: messages.PLAY_SOUND,
      offscreen: true,
      payload: {
        source: constants.soundSource,
        volume: defaults.soundVolume,
      },
    })
  } catch (err) {
    console.error('Could not play sound', err)
  }
}

async function skipRest() {
  const timerDuration = await storage.getTimerDuration()
  createNewAlarm(timerDuration)
  removeAllOverlay()
}

async function startTimer() {
  storage.setIsRunning(true)
  const timerDuration = await storage.getTimerDuration()
  createNewAlarm(timerDuration)
}

async function stopTimer() {
  storage.setIsRunning(false)
  storage.setAlarm(null)
  chrome.alarms.clearAll()
  removeAllOverlay()
}

async function onInstall() {
  const isRunning = await storage.getIsRunning()
  const timerDuration = await storage.getTimerDuration()

  if (!isRunning) return

  const alarmLength = Number(timerDuration)
  createNewAlarm(alarmLength)
}

async function onAlarm(alarm) {
  if (!(await storage.getIsRunning())) return

  const timerDuration = await storage.getTimerDuration()
  const restDuration = await storage.getRestDuration()
  const pushDesktopNotification = await storage.getPushDesktopNotification()
  const playSoundNotification = await storage.getPlaySoundNotification()

  createNewAlarm(timerDuration + restDuration)

  showAllOverlay(restDuration, restDuration)
  if (pushDesktopNotification) pushNotification()
  if (playSoundNotification) playSound()
}

async function onMessage(message) {
  // messages for offscreen.js only
  if (message.offscreen) return

  switch (message.key) {
    case messages.START:
      await startTimer()
      break
    case messages.SKIP_REST:
      await skipRest()
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

async function onTabActivated(currentTab) {
  const restDurationRemaining = await storage.getRestDurationRemaining()
  const totalRestDuration = await storage.getRestDuration()
  const isRunning = await storage.getIsRunning()

  if (isRunning && restDurationRemaining > 0) {
    showOverlay(currentTab?.tabId, totalRestDuration, restDurationRemaining)
  } else {
    removeOverlay(currentTab?.tabId)
  }
}

chrome.tabs.onActivated.addListener(onTabActivated)
chrome.runtime.onInstalled.addListener(onInstall)
chrome.alarms.onAlarm.addListener(onAlarm)
chrome.runtime.onMessage.addListener(onMessage)
