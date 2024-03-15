import { defaults, messages, notificationOptions } from './enums.js'
import {
  getTimerProperties,
  setSessionStart,
  isExtensionRunning,
  storage,
} from './storage.js'
import { AlarmHandler } from './alarms.js'

self.onmessage = (e) => {} // Keep the service worker alive

let alarmHandler = null

async function onAlarm() {
  const { pushDesktopNotification, playSoundNotification } =
    await getTimerProperties(defaults)

  if (pushDesktopNotification) createNotification()
  if (playSoundNotification) playSound()
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

  alarmHandler && alarmHandler.clearAlarms()
  alarmHandler = new AlarmHandler(storage, defaults)

  createOffscreen()
  setSessionStart(Date.now(), () => alarmHandler.createTimerAlarm(onAlarm))
}

function startExtension() {
  alarmHandler && alarmHandler.clearAlarms()
  alarmHandler = new AlarmHandler(storage, defaults)

  createOffscreen()
  setSessionStart(Date.now(), () => alarmHandler.createTimerAlarm(onAlarm))
}

function stopExtension() {
  setSessionStart(-1)
  alarmHandler && alarmHandler.clearAlarms()
}

async function onMessage(message) {
  if (message.key === messages.START_EXTENSION) startExtension()
  if (message.key === messages.SKIP_REST) startExtension()
  if (message.key === messages.STOP_EXTENSION) stopExtension()
}

chrome.runtime.onInstalled.addListener(onInstall)
chrome.runtime.onMessage.addListener(onMessage)
