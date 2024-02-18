import { defaults, states, messages, constants } from './enums.js'

/**
 *
 * @param {number} length - amount of time in ms before alarm should fire
 */
function createNewAlarm(length) {
  console.log(`creating new alarm of length: ${length / 1000}`)
  chrome.alarms.create(constants.ALARM_NAME, {
    when: Date.now() + length,
  })
}

function pushNotification() {
  console.log('push desktop notification!')
}

function playSound() {
  console.log('play sound!')
}

function onAlarm(alarm) {
  console.log('alarm fired...', alarm)
  chrome.storage.sync.get(defaults, (result) => {
    const {
      state,
      timerDuration,
      restDuration,
      pushDesktopNotification,
      playSoundNotification,
    } = result

    if (state === states.STOPPED) return

    const alarmLength = timerDuration + restDuration
    createNewAlarm(2000)

    if (pushDesktopNotification) pushNotification()
    if (playSoundNotification) playSound()
  })
}

function onInstall() {
  chrome.storage.sync.get(defaults, (result) => {
    const { state, timerDuration, restDuration } = result

    if (state === states.STOPPED) return

    const alarmLength = timerDuration + restDuration

    chrome.alarms.clearAll(() => {
      createNewAlarm(2000)
    })
  })
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
})

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.get(defaults, (result) => {
    const running = result.state === states.RUNNING
    if (running) {
      chrome.storage.sync.set({ sessionStart: Date.now() })
    }
  })
})
