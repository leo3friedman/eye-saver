const main = async () => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting)
  console.log('restIfPossible onload!')
  eyeSaver.restIfPossible()
}

const onResting = (restDurationRemaining) => {
  if (!isOverlayOn()) {
    addCanvas()
    setTimeout(removeCanvas, restDurationRemaining)
  }
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
  const canvas = document.createElement('canvas')
  canvas.className = 'eye-saver__overlay'

  styles = {
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: '0',
    left: '0',
    background: 'black',
    opacity: '.4',
    zIndex: Number.MAX_SAFE_INTEGER,
  }

  Object.keys(styles).forEach((key) => {
    canvas.style[key] = styles[key]
  })

  document.body.appendChild(canvas)
}

window.onload = main
