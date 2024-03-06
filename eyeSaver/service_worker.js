import { defaults, states, messages, notificationOptions } from './enums.js'
import { getTimerProperties, setSessionStart } from './storage.js'
self.onmessage = (e) => {} // Keep the service worker alive

async function createAlarm(duration) {
  console.log('nextAlarmIn:', duration)
  setTimeout(onAlarm, duration)
}

async function onAlarm() {
  const {
    timerDuration,
    restDuration,
    state,
    pushDesktopNotification,
    playSoundNotification,
  } = await getTimerProperties(defaults)

  if (state !== states.RUNNING) return

  if (pushDesktopNotification) createNotification()
  if (playSoundNotification) playSound()
  createAlarm(timerDuration + restDuration)
}

async function createOffscreen() {
  const offscreenExists = await chrome.offscreen.hasDocument()
  if (!offscreenExists) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
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
  const { state, timerDuration } = await getTimerProperties(defaults)

  if (state !== states.RUNNING) return

  createOffscreen()
  createAlarm(timerDuration)
  setSessionStart(Date.now())
}

chrome.runtime.onInstalled.addListener(onInstall)

// chrome.runtime.onMessage.addListener(async (message) => {
//   if (message.key === messages.PUSH_DESKTOP_NOTIFICATION) {
//     chrome.notifications.create(message.payload)
//   }

//   if (message.key === messages.PLAY_SOUND && !message.offscreen) {
//     await createOffscreen()
//     message.offscreen = true
//     await chrome.runtime.sendMessage(message)
//   }
// })
