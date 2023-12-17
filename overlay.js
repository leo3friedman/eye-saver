const main = async () => {
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const eyeSaver = new eyeSaverSrc.EyeSaver(chrome, onResting)
}

const onResting = () => {
  console.log('content script onResting ran!!!!')
}

window.onload = main
