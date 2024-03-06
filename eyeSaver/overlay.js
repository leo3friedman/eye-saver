const main = async () => {
  const { getTimerProperties } = await import(
    chrome.runtime.getURL('storage.js')
  )

  const { state, sessionStart, timerDuration, restDuration } =
    await getTimerProperties()

  if (state !== 0) return // TODO: fix hardcoding

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

  const { state, sessionStart, timerDuration, restDuration } =
    await getTimerProperties()

  if (state !== 0) return // TODO: fix hardcoding

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
  setTimeout(
    () => onAlarm(timerDuration, restDuration, 0),
    timerDuration + restDurationRemaining
  )
}

const removeCanvas = () => {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

const isOverlayOn = () => {
  return document.querySelectorAll('.eye-saver__overlay').length > 0
}

const applyStyles = (node, styles) => {
  Object.keys(styles).forEach((key) => {
    node.style[key] = styles[key]
  })
}

const addOverlay = () => {
  if (isOverlayOn()) return

  const overlay = document.createElement('div')
  overlay.className = 'eye-saver__overlay'
  applyStyles(overlay, {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: '0',
    left: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: Number.MAX_SAFE_INTEGER,
    pointerEvents: 'all',
  })

  const overlayContents = document.createElement('div')
  applyStyles(overlayContents, {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  })

  const dropzone = document.createElement('dropzone')
  dropzone.className = 'timer__dropzone'

  const skipButton = document.createElement('div')
  applyStyles(skipButton, {
    color: '#eae9eb',
    textAlign: 'center',
    fontSize: '18px',
    fontFamily: 'system-ui',
  })
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

window.onload = main
