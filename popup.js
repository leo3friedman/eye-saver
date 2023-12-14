const defaults = {
  timerDuration: 10000,
  restDuration: 5000,
}

const props = {}

window.onload = async () => {
  initializeUi()
  const timerJsUrl = chrome.runtime.getURL('templates/timer.js')
  const timerScr = await import(timerJsUrl)
  chrome.storage.sync.get(defaults, (result) => {
    const timer = new timerScr.Timer(result.timerDuration, true, () => {
      props.dropzone.remove()
    })

    timer.renderTimer(props.dropzone)
    props.startButton.onclick = () => timer.start()
    props.pauseButton.onclick = () => timer.pause()
    props.resetButton.onclick = () => timer.reset()
    props.timer = timer
  })
}

const initializeUi = () => {
  props.timerDurationInput = document.querySelector('#timer-duration-input')
  props.restDurationInput = document.querySelector('#rest-duration-input')
  props.dropzone = document.querySelector('.timer__dropzone')
  props.startButton = document.querySelector('.timer__start-button')
  props.pauseButton = document.querySelector('.timer__pause-button')
  props.resetButton = document.querySelector('.timer__reset-button')

  chrome.storage.sync.get(defaults, (result) => {
    props.timerDurationInput.value = result.timerDuration
    props.restDurationInput.value = result.restDuration
  })

  props.timerDurationInput.onchange = (event) => {
    chrome.storage.sync.set({ ['timerDuration']: event.target.value })
  }
  props.restDurationInput.onchange = (event) => {
    chrome.storage.sync.set({ ['restDuration']: event.target.value })
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    switch (key) {
      case 'timerDuration':
        props.timer.setDuration(newValue)
        break
      default:
    }
  }
})
