function destroyOverlay() {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

async function renderOverlay(totalDuration, timeRemaining) {
  const timerTemplateUrl = chrome.runtime.getURL('overlay.html')
  const xhr = new XMLHttpRequest()

  xhr.onload = async () => {
    document.body.insertAdjacentHTML('afterbegin', xhr.response)
    const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
    const dropzone = document.querySelector('.timer__dropzone')
    const skipButton = document.querySelector('.eye-saver__skip-button')

    skipButton.onclick = () => {
      destroyOverlay()
    }

    const timer = new timerSrc.Timer(
      totalDuration,
      timeRemaining,
      true,
      false,
      destroyOverlay,
      null
    )

    timer.renderTimer(dropzone)
  }
  xhr.open('GET', timerTemplateUrl)
  xhr.send()
}

async function onPageLoad() {
  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )

  const storage = new StorageManager(chrome)
  const restDuration = await storage.getRestDuration()
  const restDurationRemaining = await storage.getRestDurationRemaining()

  restDurationRemaining > 0
    ? renderOverlay(restDuration, restDurationRemaining)
    : destroyOverlay()
}

async function onStorageChanged(changes) {
  if (!changes?.restStart) return

  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )
  
  const storage = new StorageManager(chrome)
  const restDuration = await storage.getRestDuration()
  const restDurationRemaining = await storage.getRestDurationRemaining()

  restDurationRemaining > 0
    ? renderOverlay(restDuration, restDurationRemaining)
    : destroyOverlay()
}

window.onload = onPageLoad
chrome.storage.onChanged.addListener(onStorageChanged)
