window.onload = () => {
  const dropzone = document.querySelector('.timer__dropzone')
  const startButton = document.querySelector('.timer__start-button')
  const pauseButton = document.querySelector('.timer__pause-button')
  const resetButton = document.querySelector('.timer__reset-button')

  const load = async () => {
    const timerJsUrl = chrome.runtime.getURL('templates/timer.js')
    const content = await import(timerJsUrl)
    const timer = new content.Timer(10000, true, () => {
      dropzone.remove()
    })
    timer.renderTimer(dropzone)
    startButton.onclick = () => timer.start()
    pauseButton.onclick = () => timer.pause()
    resetButton.onclick = () => timer.reset()

    // content.renderTimer(dropzone)
  }
  load()
}

// const timerDurationInput = document.querySelector('#timer-duration-input')
// const restDurationInput = document.querySelector('#rest-duration-input')

// timerDurationInput.onchange = (event) => {
//   chrome.storage.sync.set({ ['timerDuration']: event.target.value })
// }
// restDurationInput.onchange = (event) => {
//   chrome.storage.sync.set({ ['restDuration']: event.target.value })
// }
