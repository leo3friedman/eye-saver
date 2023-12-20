import { defaults, states, messages } from './enums.js'

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.get(defaults, (result) => {
    const running = result.state === states.RUNNING
    if (running) {
      chrome.storage.sync.set({ sessionStart: Date.now() })
    }
  })
  // TODO: issue --> these eyeSaver function calls invoke an import() which is not allowed in a  service_worker
  // const eyeSaver = new EyeSaver(chrome, null, enums)
  // const running = await eyeSaver.isExtensionRunning()

  // if (running) {
  //   eyeSaver.setSessionStart()
  //   handleStart()
  // }
})

const pushDesktopNotification = (options) => {
  chrome.notifications.create(options)
}

const playSound = (sound = null) => {
  console.log('play sound!')
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.key === messages.PUSH_DESKTOP_NOTIFICATION) {
    pushDesktopNotification(message.payload)
  }
  if (message.key === messages.PLAY_SOUND) {
    playSound()
  }
})
