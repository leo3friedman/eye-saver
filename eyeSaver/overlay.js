const onPageLoad = async () => {
  const { getTimerProperties } = await import(
    chrome.runtime.getURL('storage.js')
  )

  const { state, sessionStart, timerDuration, restDuration } =
    await getTimerProperties()

  const { states } = await import(chrome.runtime.getURL('enums.js'))

  if (state !== states.RUNNING) return // TODO: fix hardcoding

  const periodLength = timerDuration + restDuration
  const currentPeriodProgress = (Date.now() - sessionStart) % periodLength
  const timeUntilNextAlarm = timerDuration - currentPeriodProgress

  console.log('page load!', {
    currentPeriodProgress,
    timeUntilNextAlarm,
  })

  setTimeout(onAlarm, Math.max(timeUntilNextAlarm, 0))
}

async function onAlarm() {
  const { getTimerProperties } = await import(
    chrome.runtime.getURL('storage.js')
  )
  const { states } = await import(chrome.runtime.getURL('enums.js'))

  const { state, sessionStart, timerDuration, restDuration } =
    await getTimerProperties()

  if (state !== states.RUNNING) return // TODO: fix hardcoding

  const periodLength = timerDuration + restDuration
  const currentPeriodProgress = (Date.now() - sessionStart) % periodLength
  const timeUntilNextAlarm = timerDuration - currentPeriodProgress
  const restTimePassed = timeUntilNextAlarm < 0 ? timeUntilNextAlarm * -1 : 0

  console.log('onAlarm!', {
    currentPeriodProgress,
    timeUntilNextAlarm,
    restTimePassed,
  })

  const dropzone = addOverlay()
  renderClock(dropzone, timerDuration, restDuration, restTimePassed)
  const restDurationRemaining = Math.max(restDuration - restTimePassed, 0)

  setTimeout(removeCanvas, restDurationRemaining) // destroy overlay on restDuration end
  setTimeout(onAlarm, timerDuration + restDurationRemaining)
}

const removeCanvas = () => {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

const isOverlayOn = () => {
  return document.querySelectorAll('.eye-saver__overlay').length > 0
}

const addOverlay = () => {
  if (isOverlayOn()) return

  const overlay = document.createElement('div')
  overlay.className = 'eye-saver__overlay'

  const overlayContents = document.createElement('div')
  overlayContents.className = 'eye-saver__overlay-contents'

  const dropzone = document.createElement('dropzone')
  dropzone.className = 'timer__dropzone'

  const skipButton = document.createElement('div')
  skipButton.className = 'eye-saver__skip-button'

  skipButton.innerText = 'Skip'
  skipButton.onmouseover = (event) => {
    event.target.style.cursor = 'pointer'
  }
  skipButton.onclick = async () => {
    removeCanvas()
    // TODO: add synchronization with rest of extension (message to service worker?)
  }

  overlay.appendChild(overlayContents)
  overlayContents.appendChild(dropzone)
  overlayContents.appendChild(skipButton)
  document.body.appendChild(overlay)

  return dropzone
}

const renderClock = async (
  dropzone,
  timerDuration,
  restDuration,
  timePassed
) => {
  const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))

  const timer = new timerSrc.Timer(
    restDuration,
    timerDuration,
    timePassed,
    true,
    false,
    null,
    null
  )

  timer.renderTimer(dropzone)
}

window.onload = onPageLoad
