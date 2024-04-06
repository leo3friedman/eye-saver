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
  const soundSource = '../sounds/sound-notification.wav'
  const soundVolume = 0.5

  const { messageKeys } = await import(chrome.runtime.getURL('src/messages.js'))

  if (!message?.offscreen || message?.key !== messageKeys?.PLAY_SOUND) return
  playAudio(soundSource, soundVolume)
}

async function keepWorkerAlive() {
  setInterval(async () => {
    const serviceWorker = await navigator.serviceWorker.ready
    serviceWorker.active.postMessage('keepAlive')
  }, 10000)
}

chrome.runtime.onMessage.addListener(onMessage)
window.onload = keepWorkerAlive
