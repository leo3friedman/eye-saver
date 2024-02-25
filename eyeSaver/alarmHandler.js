import enums from './enums.js'
import { StorageManager } from './storageManager.js'

const storage = new StorageManager(chrome, false, enums)
const { defaults, messages, constants, receivers } = enums

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
  } catch (err) {
    console.log('No connection, could not send message')
  }
}

async function removeOverlay(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      key: messages.REMOVE_OVERLAY,
      receiver: receivers.OVERLAY,
    })
  } catch (err) {
    console.log('No connection, could not send message')
  }
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
  const currentTab = await getCurrentTab()
  if (currentTab?.id) removeOverlay(currentTab.id)
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
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
  const currentTab = await getCurrentTab()
  const currentTabId = currentTab?.id

  createNewAlarm(timerDuration + restDuration)

  if (currentTab === null || currentTabId === null) return

  showOverlay(currentTabId, restDuration, restDuration)
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
