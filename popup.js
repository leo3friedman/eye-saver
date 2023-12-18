const props = {}

const main = async () => {
  await initializeProps()
  initializeTesting()

  const eyeSaver = new props.eyeSaverSrc.EyeSaver(this.chrome, null)

  const timerDuration = await eyeSaver.getTimerDuration()
  const restDuration = await eyeSaver.getRestDuration()
  const running = await eyeSaver.isExtensionRunning()
  const timePassed = await eyeSaver.getCurrentProgress()

  const onFinish = async () => {
    setTimeout(() => timer.start(), await eyeSaver.getRestDurationRemaining())
  }

  const timer = new props.timerSrc.Timer(
    timerDuration,
    restDuration,
    timePassed,
    running,
    true,
    onFinish
  )

  timer.renderTimer(props.dropzone)

  props.startButton.onclick = () => {
    timer.start()
    eyeSaver.startExtension()
  }

  props.cancelButton.onclick = () => {
    timer.cancel()
    eyeSaver.stopExtension()
  }

  props.timer = timer
}

const initializeProps = async () => {
  props.timerDurationInput = document.querySelector('#timer-duration-input')
  props.restDurationInput = document.querySelector('#rest-duration-input')
  props.dropzone = document.querySelector('.timer__dropzone')
  props.startButton = document.querySelector('.timer__start-button')
  props.cancelButton = document.querySelector('.timer__cancel-button')

  props.timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
  props.enumsSrc = await import(chrome.runtime.getURL('enums.js'))

  props.eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))

  props.defaults = props.enumsSrc.defaults
  props.messages = props.enumsSrc.messages
  props.alarms = props.enumsSrc.alarms
  props.modes = props.enumsSrc.modes
  props.states = props.enumsSrc.states

  chrome.storage.sync.get(props.defaults, (result) => {
    props.timerDurationInput.value = result.timerDuration
    props.restDurationInput.value = result.restDuration
  })

  props.timerDurationInput.onchange = (event) => {
    // TODO: move this into eyeSaver.js
    chrome.storage.sync.set({ ['timerDuration']: event.target.value })
    props.timer.setDuration(event.target.value)
  }

  props.restDurationInput.onchange = (event) => {
    // TODO: move this into eyeSaver.js
    chrome.storage.sync.set({ ['restDuration']: event.target.value })
  }
}

const initializeTesting = () => {
  const sendMessageToContentScriptButton = document.querySelector(
    '.send-message-to-content-script-button'
  )
  sendMessageToContentScriptButton.onclick = () => {
    console.log('sending message initated...')
    chrome.runtime.sendMessage('PING_CONTENT_SCRIPT')
  }
}

window.onload = main

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('Message received in popup.js:', message)

  // Handle the message as needed
})
