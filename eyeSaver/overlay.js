const main = async () => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting, onBreaking)
  // console.log('restIfPossible onload!')
  // eyeSaver.restIfPossible()
  eyeSaver.handleCurrentState()
}

const onResting = (restDurationRemaining) => {
  if (!isOverlayOn()) {
    addCanvas()
    // setTimeout(removeCanvas, restDurationRemaining)
  }
}

const onBreaking = () => {
  removeCanvas()
}

const removeCanvas = () => {
  console.log('remove canvas!')
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

const isOverlayOn = () => {
  return document.querySelectorAll('.eye-saver__overlay').length > 0
}

const addCanvas = () => {
  const canvas = document.createElement('div')
  const dropzone = document.createElement('dropzone')
  canvas.className = 'eye-saver__overlay'
  dropzone.className = 'timer__dropzone'
  dropzone.style.display = 'block'

  const styles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: '0',
    left: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: Number.MAX_SAFE_INTEGER,
  }

  Object.keys(styles).forEach((key) => {
    canvas.style[key] = styles[key]
  })

  canvas.appendChild(dropzone)
  document.body.appendChild(canvas)
  renderClock(dropzone)
}

const renderClock = async (dropzone) => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting)

  const timerDuration = await eyeSaver.getTimerDuration()
  const restDuration = await eyeSaver.getRestDuration()
  const running = await eyeSaver.isExtensionRunning()
  const timePassed = restDuration - (await eyeSaver.getRestDurationRemaining())
  // const timePassed = await eyeSaver.getCurrentProgress()

  const timer = new timerSrc.Timer(
    restDuration,
    timerDuration,
    timePassed,
    running,
    false,
    null
  )

  timer.renderTimer(dropzone)
}

window.onload = main
