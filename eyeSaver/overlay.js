let eyeSaver

const main = async () => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting, onBreaking)
  eyeSaver.handleCurrentState()
}

const onResting = () => {
  if (!isOverlayOn()) {
    addOverlay()
  }
}

const onBreaking = () => {
  removeCanvas()
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
    await eyeSaver.setSessionStart()
  }

  overlay.appendChild(overlayContents)
  overlayContents.appendChild(dropzone)
  overlayContents.appendChild(skipButton)
  document.body.appendChild(overlay)
  renderClock(dropzone)
}

const renderClock = async (dropzone) => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(
    chrome,
    () => {},
    () => {}
  )

  const timerDuration = await eyeSaver.getTimerDuration()
  const restDuration = await eyeSaver.getRestDuration()
  const running = await eyeSaver.isExtensionRunning()
  const timePassed = restDuration - (await eyeSaver.getRestDurationRemaining())

  const timer = new timerSrc.Timer(
    restDuration,
    timerDuration,
    timePassed,
    running,
    false,
    null,
    null
  )

  timer.renderTimer(dropzone)
}

window.onload = main
