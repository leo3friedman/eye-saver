import { defaults, messages, notificationOptions } from './enums.js'
import {
  getTimerProperties,
  setSessionStart,
  isExtensionRunning,
} from './storage.js'
self.onmessage = (e) => {} // Keep the service worker alive

const alarms = []

async function createAlarm(duration) {
  alarms.map((timeout) => clearTimeout(timeout))
  const alarmTimeout = setTimeout(onAlarm, duration)
  alarms.push(alarmTimeout)
}

async function onAlarm() {
  if (!(await isExtensionRunning(defaults))) return

  const {
    timerDuration,
    restDuration,
    pushDesktopNotification,
    playSoundNotification,
  } = await getTimerProperties(defaults)

  if (pushDesktopNotification) createNotification()
  if (playSoundNotification) playSound()
  createAlarm(timerDuration + restDuration)
}

async function createOffscreen() {
  const offscreenExists = await chrome.offscreen.hasDocument()
  if (!offscreenExists) {
    await chrome.offscreen.createDocument({
      url: 'src/offscreen.html',
      reasons: ['BLOBS', 'AUDIO_PLAYBACK'],
      justification: 'notification',
    })
  }
}

function createNotification() {
  const notification = {
    type: notificationOptions.type,
    iconUrl: notificationOptions.iconUrl,
    title: notificationOptions.title,
    message: notificationOptions.lookAwayMessage,
  }
  chrome.notifications.create(notification)
}

async function playSound() {
  await createOffscreen()
  await chrome.runtime.sendMessage({
    key: messages.PLAY_SOUND,
    offscreen: true,
  })
}

async function onInstall() {
  if (!(await isExtensionRunning(defaults))) return

  const { timerDuration } = await getTimerProperties(defaults)

  createOffscreen()
  createAlarm(timerDuration)
  setSessionStart(Date.now())
}

async function onMessage(message) {
  const { timerDuration } = await getTimerProperties(defaults)
  switch (message.key) {
    case messages.START_EXTENSION:
      alarms.map((timeout) => clearTimeout(timeout))
      createOffscreen()
      createAlarm(timerDuration)
      setSessionStart(Date.now())
      break
    case messages.STOP_EXTENSION:
      alarms.map((timeout) => clearTimeout(timeout))
      setSessionStart(-1)
      break
    case messages.SKIP_REST:
      alarms.map((timeout) => clearTimeout(timeout))
      createOffscreen()
      createAlarm(timerDuration)
      setSessionStart(Date.now())
      break
  }
}

chrome.runtime.onInstalled.addListener(onInstall)
chrome.runtime.onMessage.addListener(onMessage)
