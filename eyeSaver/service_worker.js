import { messages, defaults, states } from './enums.js'
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
  chrome.storage.sync.get(defaults, (result) => {
    console.log(result.state === states.RUNNING)
    const running = result.state === states.RUNNING
    console.log(running)
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
