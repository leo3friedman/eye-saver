const main = async () => {
  const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))

  /**
   * RENDERING THE TIMER
   */

  const eyeSaver = new eyeSaverSrc.EyeSaver(this.chrome, null)
  const dropzone = document.querySelector('.timer__dropzone')
  const timerDuration = await eyeSaver.getTimerDuration()
  const restDuration = await eyeSaver.getRestDuration()
  const running = await eyeSaver.isExtensionRunning()
  const timePassed = await eyeSaver.getCurrentProgress()

  // TODO: is this the right approach?
  const onFinish = async () => {
    const restDurationRemaining = await eyeSaver.getRestDurationRemaining()
    const timerDurationRemaining = await eyeSaver.getTimerDurationRemaining()
    const restDuration = await eyeSaver.getRestDuration()
    const timeout =
      restDurationRemaining > 0
        ? restDurationRemaining
        : timerDurationRemaining + restDuration
    console.log('onFinishTimeout', timeout)
    setTimeout(async () => {
      const running = await eyeSaver.isExtensionRunning()
      if (running) timer.start()
    }, timeout)
  }

  const timer = new timerSrc.Timer(
    timerDuration,
    restDuration,
    timePassed,
    running,
    true,
    onFinish
  )

  timer.renderTimer(dropzone)

  /**
   * INITIALIZING DOM ELEMENTS
   */

  const inputs = {
    timerDurationInput: document.querySelector('#timer-duration-input'),
    restDurationInput: document.querySelector('#rest-duration-input'),
  }
  const inputsArr = Object.values(inputs)
  const startButton = document.querySelector('.timer__start-button')
  const cancelButton = document.querySelector('.timer__cancel-button')

  inputs.timerDurationInput.value = await eyeSaver.getTimerDuration()
  inputs.restDurationInput.value = await eyeSaver.getRestDuration()

  inputs.timerDurationInput.onchange = (event) => {
    eyeSaver.setTimerDuration(event.target.value)
    timer.setTimerDuration(event.target.value)
  }

  inputs.restDurationInput.onchange = (event) => {
    eyeSaver.setRestDuration(event.target.value)
    timer.setRestDuration(event.target.value)
  }
  running ? disableDurationInputs(inputsArr) : enableDurationInputs(inputsArr)

  startButton.onclick = () => {
    timer.start()
    eyeSaver.startExtension()
    disableDurationInputs(inputsArr)
  }

  cancelButton.onclick = () => {
    timer.cancel()
    eyeSaver.stopExtension()
    enableDurationInputs(inputsArr)
  }

  /**
   *  INITIALIZING ELEMENTS USED FOR TESTING (DEV PURPOSES ONLY)
   */

  const sendMessageToContentScriptButton = document.querySelector(
    '.send-message-to-content-script-button'
  )
  sendMessageToContentScriptButton.onclick = () => {
    console.log('sending from popup message initated...')
    chrome.runtime.sendMessage('PING_CONTENT_SCRIPT')
  }
}

const disableDurationInputs = (inputs) => {
  inputs.forEach((input) => input.setAttribute('disabled', ''))
}

const enableDurationInputs = (inputs) => {
  inputs.forEach((input) => input.removeAttribute('disabled'))
}

window.onload = main

// TODO: implement when skip is clicked on rest
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('Message received in popup.js:', message)
  // Handle the message as needed
})
