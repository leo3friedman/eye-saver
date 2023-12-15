import { defaults, messages } from './enums.js'

chrome.runtime.onInstalled.addListener(() => {
  console.log('install')
  chrome.alarms.clearAll()
  createAlarm()
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  chrome.alarms.clearAll()
  requestInitiateRest()
})

const createAlarm = () => {
  chrome.storage.sync.get(defaults, (result) => {
    chrome.alarms.create('restAlarm', {
      when: Date.now() + Number(result.timerDuration),
    })
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message === messages.INITIATE_REST) {
    console.log('request from popup recieved!')
    requestInitiateRest()
  }
})

const requestInitiateRest = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  try {
    const response = await chrome.tabs.sendMessage(
      tab.id,
      messages.INITIATE_REST
    )
    if (response != messages.INITIATE_REST_RECIEVED) {
      console.log('unexpected message recieved, reseting alarm...')
      createAlarm()
    }
  } catch (e) {
    console.log('error messaging, reseting alarm...')
    createAlarm()
  }
}
