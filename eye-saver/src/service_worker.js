import { messageKeys } from './messages.js'
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
    await getTimerProperties()
  if (pushDesktopNotification) createNotification()
  if (playSoundNotification) playSound()

  async function onRestTimeOver() {
    const { playSoundNotification } = await getTimerProperties()
    if (playSoundNotification) playSound()
  }

  const restDurationRemaining = await alarmHandler.getRestDurationRemaining()

  // play sound when rest is over
  alarmHandler.createSimpleAlarm(onRestTimeOver, restDurationRemaining)
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
    title: 'Eye Saver',
    type: 'basic',
    iconUrl: '../images/icon-64.png',
    message: 'Look away from the screen!',
  }
  chrome.notifications.create(notification)
}

async function playSound() {
  await createOffscreen()
  await chrome.runtime.sendMessage({
    key: messageKeys.PLAY_SOUND,
    offscreen: true,
  })
}

async function onInstall({ reason }) {
  if (reason === 'install' || reason === 'update') {
    chrome.tabs.create({
      url: 'src/onboarding.html',
    })
  }

  if (!(await isExtensionRunning())) return

  alarmHandler && alarmHandler.clearAlarms()
  alarmHandler = new AlarmHandler(storage)

  createOffscreen()
  setSessionStart(Date.now(), () => alarmHandler.createTimerAlarm(onAlarm))
}

function startExtension() {
  alarmHandler && alarmHandler.clearAlarms()
  alarmHandler = new AlarmHandler(storage)

  createOffscreen()
  setSessionStart(Date.now(), () => alarmHandler.createTimerAlarm(onAlarm))
}

function stopExtension() {
  setSessionStart(-1)
  alarmHandler && alarmHandler.clearAlarms()
}

async function snoozeExtension() {
  alarmHandler && alarmHandler.clearAlarms()
  const { timerDuration, snoozeDuration } = await getTimerProperties()

  setSessionStart(Date.now() - timerDuration + snoozeDuration, () =>
    alarmHandler.createTimerAlarm(onAlarm)
  )
}

async function onMessage(message) {
  if (message.key === messageKeys.START_EXTENSION) startExtension()
  if (message.key === messageKeys.SKIP_REST) startExtension()
  if (message.key === messageKeys.STOP_EXTENSION) stopExtension()
  if (message.key === messageKeys.SNOOZE_REST) snoozeExtension()
}

chrome.runtime.onInstalled.addListener(onInstall)
chrome.runtime.onMessage.addListener(onMessage)
