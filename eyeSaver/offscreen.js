async function playAudio(source, volume) {
  const audio = document.querySelector('audio')
  audio.src = source
  audio.volume = volume

  try {
    await audio.play() // TODO: why is this throwing an error?
  } catch (e) {
    console.error(e)
  }
}

async function onMessage(message) {
  const { messages, defaults } = await import(chrome.runtime.getURL('enums.js'))
  if (!message?.offscreen || message?.key !== messages.PLAY_SOUND) return
  playAudio(defaults.soundSource, defaults.soundVolume)
}

function keeepWorkerAlive() {
  setInterval(async () => {
    const serviceWorker = await navigator.serviceWorker.ready
    serviceWorker.active.postMessage('keepAlive')
  }, 10000)
}

chrome.runtime.onMessage.addListener(onMessage)
window.onload = keeepWorkerAlive
