const timerDurationInput = document.querySelector('#timer-duration-input')
const restDurationInput = document.querySelector('#rest-duration-input')

timerDurationInput.onchange = (event) => {
  chrome.storage.sync.set({ ['timerDuration']: event.target.value })
}
restDurationInput.onchange = (event) => {
  chrome.storage.sync.set({ ['restDuration']: event.target.value })
}
