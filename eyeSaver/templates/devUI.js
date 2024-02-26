export async function injectDevUI(htmlURL) {
  const xhr = new XMLHttpRequest()

  xhr.onload = () => {
    document.body.insertAdjacentHTML('beforeend', xhr.response)
    initializeUI()
  }
  xhr.open('GET', htmlURL)
  xhr.send()
}

async function initializeUI() {
  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )

  const storage = new StorageManager(chrome)

  const timerDurationInput = document.querySelector(
    '#test-timer-duration-input'
  )
  timerDurationInput.value = await storage.getTimerDuration()
  timerDurationInput.onchange = (event) => {
    storage.setTimerDuration(event.target.value)
    timer.setTimerDuration(event.target.value)
  }
  const restDurationInput = document.querySelector('#test-rest-duration-input')
  restDurationInput.value = await storage.getRestDuration()

  restDurationInput.onchange = (event) => {
    storage.setRestDuration(event.target.value)
  }

  document.querySelector('.send-desktop-notification-button').onclick = () => {
    chrome.runtime.sendMessage({ key: messages.PUSH_DESKTOP_NOTIFICATION })
  }

  document.querySelector('.play-sound-button').onclick = () => {
    chrome.runtime.sendMessage({ key: messages.PLAY_SOUND })
  }
}
