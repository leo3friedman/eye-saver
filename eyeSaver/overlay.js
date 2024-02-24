let timerGlobal

function destroyOverlay() {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

function endTimer(timer) {
  console.log('trying to cancel...')
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
    // console.log('xhr loaded!')
    console.log(xhr.response)
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

async function onStorageChanged(changes) {
  if (!changes?.alarm) return

  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )

  const storage = new StorageManager(chrome)
  const restDurationRemaining = await storage.getRestDurationRemaining()
  const running = await storage.getIsRunning()
  const restDuration = await storage.getRestDuration()

  if (restDurationRemaining > 0 && running) {
    renderOverlay(restDuration, restDurationRemaining)
  } else {
    destroyOverlay()
    endTimer(timerGlobal)
  }
}

window.onload = onPageLoad
chrome.storage.onChanged.addListener(onStorageChanged)
