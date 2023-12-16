const props = {}

const initializeProps = async () => {
  props.timerDurationInput = document.querySelector('#timer-duration-input')
  props.restDurationInput = document.querySelector('#rest-duration-input')
  props.dropzone = document.querySelector('.timer__dropzone')
  props.startButton = document.querySelector('.timer__start-button')
  props.pauseButton = document.querySelector('.timer__pause-button')
  props.resetButton = document.querySelector('.timer__reset-button')

  props.timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
  props.enumsSrc = await import(chrome.runtime.getURL('enums.js'))
  props.defaults = props.enumsSrc.defaults
  props.messages = props.enumsSrc.messages
  props.alarms = props.enumsSrc.alarms
  props.modes = props.enumsSrc.modes

  chrome.storage.sync.get(props.defaults, (result) => {
    props.timerDurationInput.value = result.timerDuration
    props.restDurationInput.value = result.restDuration
  })

  props.timerDurationInput.onchange = (event) => {
    chrome.storage.sync.set({ ['timerDuration']: event.target.value })
    props.timer.setDuration(event.target.value)
  }
  props.restDurationInput.onchange = (event) => {
    chrome.storage.sync.set({ ['restDuration']: event.target.value })
  }
}

const initiateRest = () => {
  chrome.runtime.sendMessage(props.messages.INITIATE_REST)
}

window.onload = async () => {
  await initializeProps()

  const alarm = await chrome.alarms.get(props.alarms.REST_ON_ALARM)

  chrome.storage.sync.get(props.defaults, (result) => {
    // TODO: Migrate to timeRemaining (rather than timePassed)
    const timerDuration = Number(result.timerDuration)
    let timePassed = 0
    if (!alarm) {
      timePassed = timerDuration
    } else if (alarm.scheduledTime - Date.now() > timerDuration) {
      timePassed = timerDuration
    } else {
      timePassed = timerDuration - (alarm.scheduledTime - Date.now())
    }

    console.log(timePassed, result.timerDuration, 'here!')

    const timer = new props.timerSrc.Timer(
      timePassed,
      result.timerDuration,
      true,
      initiateRest
    )

    timer.renderTimer(props.dropzone)
    props.startButton.onclick = () => timer.start()
    props.pauseButton.onclick = () => timer.pause()
    props.resetButton.onclick = () => timer.reset()
    props.timer = timer
  })
}

chrome.storage.onChanged.addListener((changes, area) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'mode' && newValue === props.modes.SCREEN_TIME) {
      if (props.timer) props.timer.start()
    }
  }
})
