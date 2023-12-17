const main = async () => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting)
  eyeSaver.restIfPossible()
}

const onResting = (restDurationRemaining) => {
  console.log(
    'content script onResting ran!!!!, restDuration remaining:',
    restDurationRemaining
  )
}

window.onload = main
