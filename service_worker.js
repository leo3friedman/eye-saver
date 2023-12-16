import { defaults, messages, modes, alarms } from './enums.js'
// TODO: better synchronization
let handlingRestStart = 0

const createAlarm = (includeRest = false) => {
  chrome.alarms.clearAll()
  chrome.storage.sync.get(defaults, (result) => {
    const restDuration = includeRest ? Number(result.restDuration) : 0
    const timerDuration = Number(result.timerDuration)
    chrome.alarms.create(alarms.REST_ON_ALARM, {
      when: Date.now() + restDuration + timerDuration,
    })
  })
}

const handleRestStart = async () => {
  if (handlingRestStart > 0) return

  handlingRestStart = 1

  createAlarm(true)

  // Trigger overlay in content script
  await chrome.storage.sync.set({ mode: modes.SCREEN_TIME })
  await chrome.storage.sync.set({ mode: modes.BREAK_TIME })

  // push desktop notification

  // push sound notification
}

const handleRestEnd = async () => {
  handlingRestStart = 0
  createAlarm(false)
  chrome.storage.sync.set({ mode: modes.SCREEN_TIME })

  // push desktop notification

  // push sound notification
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('install')
  createAlarm()
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  chrome.alarms.clearAll()
  handleRestStart()
})

chrome.runtime.onMessage.addListener((message) => {
  if (message === messages.INITIATE_REST) {
    handleRestStart()
  }
  if (message === messages.INITIATE_REST_END) {
    handleRestEnd()
  }
})
