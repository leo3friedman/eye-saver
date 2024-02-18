const main = async () => {
  const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
  const eyeSaverSrc = await import(chrome.runtime.getURL('eyeSaver.js'))
  const enums = await import(chrome.runtime.getURL('enums.js'))
  /**
   * RENDERING THE TIMER
   */

  const eyeSaver = new eyeSaverSrc.EyeSaver(
    this.chrome,
    () => {},
    () => {}
  )
  const dropzone = document.querySelector('.timer__dropzone')
  const timerDuration = await eyeSaver.getTimerDuration()
  const restDuration = await eyeSaver.getRestDuration()
  const running = await eyeSaver.isExtensionRunning()
  const timePassed = await eyeSaver.getCurrentProgress()

  const startStopButton = document.createElement('div')
  startStopButton.onmouseover = (event) => {
    event.target.style.cursor = 'pointer'
  }

  startStopButton.innerText = running ? 'Cancel' : 'Start'
  startStopButton.onclick = async (event) => {
    if (await eyeSaver.isExtensionRunning()) {
      timer.cancel()
      await eyeSaver.stopExtension()
      enableDurationInputs()
    } else {
      timer.start()
      await eyeSaver.startExtension()
      disableDurationInputs()
    }
    event.target.innerText = (await eyeSaver.isExtensionRunning())
      ? 'Cancel'
      : 'Start'
  }

  const onFinish = async () => {
    const restDurationRemaining = await eyeSaver.getRestDurationRemaining()
    const timerDurationRemaining = await eyeSaver.getTimerDurationRemaining()
    const restDuration = await eyeSaver.getRestDuration()
    const timeout =
      restDurationRemaining > 0
        ? restDurationRemaining
        : timerDurationRemaining + restDuration

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
    onFinish,
    startStopButton
  )

  timer.renderTimer(dropzone)

  /**
   * INITIALIZING UI ELEMENTS
   */

  setTimerDurationInputText(timerDuration)
  setRestDurationInputText(restDuration)

  running ? disableDurationInputs() : enableDurationInputs()

  document.querySelector('.timer-duration-increment-up').onclick = async () => {
    const defaults = enums.timerInputDefaults
    const duration = await eyeSaver.getTimerDuration()

    const newDuration = Math.min(
      defaults.maxTimerDuration,
      duration + defaults.timerDurationIncrement
    )

    const rounded =
      Math.ceil(newDuration / defaults.timerDurationIncrement) *
      defaults.timerDurationIncrement

    await eyeSaver.setTimerDuration(rounded)
    setTimerDurationInputText(rounded)
    timer.setTimerDuration(rounded)
  }

  document.querySelector('.timer-duration-increment-down').onclick =
    async () => {
      const defaults = enums.timerInputDefaults
      const duration = await eyeSaver.getTimerDuration()

      const newDuration = Math.max(
        defaults.minTimerDuration,
        duration - defaults.timerDurationIncrement
      )

      const rounded =
        Math.ceil(newDuration / defaults.timerDurationIncrement) *
        defaults.timerDurationIncrement

      await eyeSaver.setTimerDuration(rounded)
      setTimerDurationInputText(rounded)
      timer.setTimerDuration(rounded)
    }

  document.querySelector('.rest-duration-increment-up').onclick = async () => {
    const defaults = enums.timerInputDefaults
    const duration = await eyeSaver.getRestDuration()

    const newDuration = Math.min(
      defaults.maxRestDuration,
      duration + defaults.restDurationIncrement
    )

    const rounded =
      Math.ceil(newDuration / defaults.restDurationIncrement) *
      defaults.restDurationIncrement

    await eyeSaver.setRestDuration(rounded)
    setRestDurationInputText(rounded)
  }

  document.querySelector('.rest-duration-increment-down').onclick =
    async () => {
      const defaults = enums.timerInputDefaults
      const duration = await eyeSaver.getRestDuration()

      const newDuration = Math.max(
        defaults.minRestDuration,
        duration - defaults.restDurationIncrement
      )

      const rounded =
        Math.ceil(newDuration / defaults.restDurationIncrement) *
        defaults.restDurationIncrement

      await eyeSaver.setRestDuration(rounded)
      setRestDurationInputText(rounded)
    }

  const desktopNotificationCheckbox = document.querySelector(
    '#desktop-notification-checkbox'
  )
  const soundNotificationCheckbox = document.querySelector(
    '#sound-notification-checkbox'
  )
  desktopNotificationCheckbox.checked =
    await eyeSaver.getPushDesktopNotification()
  desktopNotificationCheckbox.onclick = async (event) => {
    eyeSaver.setPushDesktopNotification(event.target.checked)
  }
  soundNotificationCheckbox.checked = await eyeSaver.getPlaySoundNotification()
  soundNotificationCheckbox.onclick = async (event) => {
    eyeSaver.setPlaySoundNotification(event.target.checked)
  }
  /**
   *  INITIALIZING ELEMENTS USED FOR TESTING (DEV PURPOSES ONLY)
   */

  const inputs = {
    timerDurationInput: document.querySelector('#test-timer-duration-input'),
    restDurationInput: document.querySelector('#test-rest-duration-input'),
  }

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

  document.querySelector('.send-desktop-notification-button').onclick = () => {
    eyeSaver.pushDesktopNotification()
  }

  document.querySelector('.play-sound-button').onclick = () => {
    eyeSaver.playSound()
  }

  // toggle testing on and off here (TODO: make better system for managing this)
  if (true) document.querySelector('.testing-section').style.display = 'none'
}

const disableDurationInputs = () => {
  const container = document.querySelector(
    '.settings-subsection__content.timer-settings'
  )
  container.style.pointerEvents = 'none'
  container.style.opacity = '.4'
  const warningText = document.querySelector('.duration-input-warning')
  warningText.style.display = 'inline'
}
const enableDurationInputs = () => {
  const container = document.querySelector(
    '.settings-subsection__content.timer-settings'
  )
  container.style.pointerEvents = 'auto'
  container.style.opacity = '1'
  const warningText = document.querySelector('.duration-input-warning')
  warningText.style.display = 'none'
}

const setTimerDurationInputText = (time) => {
  const hours = timeToText(time).hours
  const minutes = ('0' + timeToText(time).minutes).slice(-2)
  document.querySelector('.__time-input.timer-duration__hours').innerText =
    hours
  document.querySelector('.__time-input.timer-duration__minutes').innerText =
    minutes
}

const setRestDurationInputText = (time) => {
  const minutes = timeToText(time).minutes
  const seconds = ('0' + timeToText(time).seconds).slice(-2)
  document.querySelector('.__time-input.rest-duration__minutes').innerText =
    minutes
  document.querySelector('.__time-input.rest-duration__seconds').innerText =
    seconds
}

/**
 *
 * @param {number} time time in milliseconds to convert
 * @returns {Object} An object representing the time in hours, minutes, and seconds
 */
const timeToText = (time) => {
  const date = new Date(0, 0, 0, 0, 0, 0, time)
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }
}

window.onload = main
