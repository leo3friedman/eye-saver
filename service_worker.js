import { messages } from './enums.js'
import { EyeSaver } from './eyeSaver.js'

const messageEyeSaver = async (message) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  try {
    const response = await chrome.tabs.sendMessage(tab.id, message)
  } catch (e) {
    console.log('error messaging, reseting alarm...', e)
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const eyeSaver = new EyeSaver(chrome, null)

  // TODO: issue --> these eyeSaver function calls invoke an import() which is not allowed in a  service_worker
  const running = await eyeSaver.isExtensionRunning()

  if (running) {
    eyeSaver.setSessionStart()
    handleStart()
  }
})

chrome.runtime.onMessage.addListener((message) => {
  if (message === 'PING_CONTENT_SCRIPT') {
    console.log('service_worker recieved message from popup...')
    chrome.runtime.sendMessage({ greeting: 'Hello from background.js!' })
    // pingEyeSaver()
  }
})

// TODO: is this step necessary??
chrome.tabs.onActivated.addListener(() => {
  messageEyeSaver(messages.ACTIVATE)
})
