chrome.runtime.onMessage.addListener(async (message) => {
  const enums = await import(chrome.runtime.getURL('enums.js'))
  if (message?.key === enums?.messages?.PLAY_SOUND && message?.offscreen) {
    const { source, volume } = message?.payload
    playAudio(source, volume)
  }
})

const audio = document.querySelector('audio')

const playAudio = async (source, volume) => {
  audio.src = source
  audio.volume = volume

  // TODO: why is this throwing an error?
  try {
    await audio.play()
  } catch (e) {
    console.error(e)
  }
}
