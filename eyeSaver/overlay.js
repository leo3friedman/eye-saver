let timerGlobal

function overlayExists() {
  return document.querySelectorAll('.eye-saver__overlay').length > 0
}

function destroyOverlay() {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

function endTimer(timer) {
  if (timer) {
    timer.cancel()
  }
}

async function skipRest(timer) {
  destroyOverlay()
  endTimer(timer)

  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )
  const storage = new StorageManager(chrome)
  const { messages } = await storage.getEnums()

  chrome.runtime.sendMessage({ key: messages.SKIP_REST })
}

async function renderOverlay(totalDuration, timeRemaining) {
  const timerTemplateUrl = chrome.runtime.getURL('overlay.html')
  const xhr = new XMLHttpRequest()

  xhr.onload = async () => {
    document.body.insertAdjacentHTML('afterbegin', xhr.response)
    const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
    const timer = new timerSrc.Timer(
      totalDuration,
      timeRemaining,
      true,
      false,
      destroyOverlay,
      null
    )

    document.querySelector('.eye-saver__skip-button').onclick = () => {
      skipRest(timer)
    }

    // global set so other functions can cancel
    timerGlobal = timer

    timer.renderTimer(document.querySelector('.timer__dropzone'))
  }
  xhr.open('GET', timerTemplateUrl)
  xhr.send()
}

async function onPageLoad() {
  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )

  const storage = new StorageManager(this.chrome)
  const restDuration = await storage.getRestDuration()
  const restDurationRemaining = await storage.getRestDurationRemaining()
  const running = await storage.getIsRunning()

  if (restDurationRemaining > 0 && running) {
    renderOverlay(restDuration, restDurationRemaining)
  } else {
    destroyOverlay()
    endTimer(timerGlobal)
  }  
}

async function onMessage(message) {
  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )

  const storage = new StorageManager(this.chrome)

  const { messages, receivers } = await storage.getEnums()

  if (message?.receiver !== receivers.OVERLAY) {
    return
  }

  switch (message?.key) {
    case messages.SHOW_OVERLAY:
      const { totalRestDuration, restDurationRemaining } = message.payload
      if (!overlayExists())
        renderOverlay(totalRestDuration, restDurationRemaining)
      break

    case messages.REMOVE_OVERLAY:
      destroyOverlay()
      endTimer(timerGlobal)
      break
  }
}

window.onload = onPageLoad
chrome.runtime.onMessage.addListener(onMessage)
