window.onload = () => {
  const dropzone = document.querySelector('.timer__dropzone')
  const startButton = document.querySelector('.timer__start-button')

  const load = async () => {
    const timerJsUrl = chrome.runtime.getURL('templates/timer.js')
    const content = await import(timerJsUrl)
    const timer = new content.Timer()
    timer.renderTimer(dropzone)
    startButton.onclick = () => timer.startTimer(0, true)
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
