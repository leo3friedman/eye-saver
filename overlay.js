const main = async () => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting)
  eyeSaver.restIfPossible()
}

const onResting = (restDurationRemaining) => {
  console.log('REST INITIATED, restDuration remaining:', restDurationRemaining)
}

window.onload = main
