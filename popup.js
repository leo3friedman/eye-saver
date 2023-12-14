window.onload = () => {
  const dropzone = document.querySelector('.timer-dropzone')

  const load = async () => {
    const timerJsUrl = chrome.runtime.getURL('templates/timer.js')
    const content = await import(timerJsUrl)

    content.renderTimer(dropzone)
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
