function destroyOverlay() {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

async function renderOverlay(totalDuration, timePassed) {
  const overlay = document.createElement('div')
  const overlayContents = document.createElement('div')
  const dropzone = document.createElement('dropzone')
  const skipButton = document.createElement('div')

  overlay.className = 'eye-saver__overlay'
  overlayContents.className = 'eye-saver__overlay-contents'
  dropzone.className = 'timer__dropzone'
  skipButton.className = 'eye-saver__skip-button'

  skipButton.innerText = 'Skip'
  skipButton.onclick = async () => {
    destroyOverlay()
    // TODO: message to alarmHandler.js to force new alarm
  }

  overlay.appendChild(overlayContents)
  overlayContents.appendChild(dropzone)
  overlayContents.appendChild(skipButton)
  document.body.appendChild(overlay)

  const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))

  const timer = new timerSrc.Timer(
    totalDuration,
    0,
    timePassed,
    true,
    false,
    destroyOverlay,
    null
  )

  timer.renderTimer(dropzone)
}

window.onload = async () => {
  const enums = await import(chrome.runtime.getURL('enums.js'))

  chrome.storage.sync.get(enums.defaults, (result) => {
    const restDuration = Number(result.restDuration)
    const restStart = Number(result.restStart)
    const timePassed = Date.now() - restStart

    timePassed < restDuration
      ? renderOverlay(restDuration, timePassed)
      : destroyOverlay()
  })
}

chrome.storage.onChanged.addListener(async (changes) => {
  const newRestStart = changes?.restStart?.newValue

  if (!newRestStart || newRestStart < 0) {
    destroyOverlay()
    return
  }

  const enums = await import(chrome.runtime.getURL('enums.js'))
  chrome.storage.sync.get(enums.defaults, (result) => {
    const restDuration = Number(result.restDuration)
    const timePassed = Date.now() - Number(newRestStart)
    renderOverlay(restDuration, timePassed)
  })
})
