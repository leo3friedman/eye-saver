import { defaults, states, messages } from './enums.js'

// TODO: is this necessary + how to use eyeSaver for this? (import not allowed)
chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.get(defaults, (result) => {
    const running = result.state === states.RUNNING
    if (running) {
      chrome.storage.sync.set({ sessionStart: Date.now() })
    }
  })
})

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
