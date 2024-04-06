window.onload = async () => {
  const { getTimerProperties, storage } = await import(
    chrome.runtime.getURL('src/storage.js')
  )
  const { timerDuration, restDuration } = await getTimerProperties()

  const inputs = {
    timerDurationInput: document.querySelector('#test-timer-duration-input'),
    restDurationInput: document.querySelector('#test-rest-duration-input'),
  }

  inputs.timerDurationInput.value = timerDuration
  inputs.restDurationInput.value = restDuration

  inputs.timerDurationInput.onchange = (event) => {
    storage.setTimerDuration(Number(event.target.value))
  }

  inputs.restDurationInput.onchange = (event) => {
    storage.setRestDuration(Number(event.target.value))
  }
}
