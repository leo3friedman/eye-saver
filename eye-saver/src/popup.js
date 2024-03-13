/**
 *
 * @param {number} time time in milliseconds to convert
 * @returns {Object} An object representing the time in hours, minutes, and seconds
 */
function timeToText(time) {
  const date = new Date(0, 0, 0, 0, 0, 0, time)
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }
}

async function startExtension() {
  const { messages } = await import(chrome.runtime.getURL('src/enums.js'))
  chrome.runtime.sendMessage({ key: messages.START_EXTENSION })
}

async function stopExtension() {
  const { messages } = await import(chrome.runtime.getURL('src/enums.js'))
  chrome.runtime.sendMessage({ key: messages.STOP_EXTENSION })
}

function disableDurationInputs() {
  const container = document.querySelector(
    '.settings-subsection__content.timer-settings'
  )
  container.style.pointerEvents = 'none'
  container.style.opacity = '.4'
  const warningText = document.querySelector('.duration-input-warning')
  warningText.style.display = 'inline'
}

function enableDurationInputs() {
  const container = document.querySelector(
    '.settings-subsection__content.timer-settings'
  )
  container.style.pointerEvents = 'auto'
  container.style.opacity = '1'
  const warningText = document.querySelector('.duration-input-warning')
  warningText.style.display = 'none'
}

function setTimerDurationInputText(time) {
  const hours = timeToText(time).hours
  const minutes = ('0' + timeToText(time).minutes).slice(-2)
  document.querySelector('.__time-input.timer-duration__hours').innerText =
    hours
  document.querySelector('.__time-input.timer-duration__minutes').innerText =
    minutes
}

function setRestDurationInputText(time) {
  const minutes = timeToText(time).minutes
  const seconds = ('0' + timeToText(time).seconds).slice(-2)
  document.querySelector('.__time-input.rest-duration__minutes').innerText =
    minutes
  document.querySelector('.__time-input.rest-duration__seconds').innerText =
    seconds
}

async function onPopupLoad() {
  const { Timer } = await import(chrome.runtime.getURL('src/timer.js'))
  const { storage } = await import(chrome.runtime.getURL('src/storage.js'))
  const { createDevUI } = await import(chrome.runtime.getURL('src/util.js'))
  const { timerInputDefaults } = await import(
    chrome.runtime.getURL('src/enums.js')
  )

  const running = await storage.isExtensionRunning()

  const {
    sessionStart,
    timerDuration,
    restDuration,
    pushDesktopNotification,
    playSoundNotification,
  } = await storage.getTimerProperties()

  /**
   * RENDERING THE TIMER
   */

  const dropzone = document.querySelector('.timer__dropzone')

  const periodLength = timerDuration + restDuration
  const currentPeriodProgress = (Date.now() - sessionStart) % periodLength

  const startStopButton = document.createElement('div')

  startStopButton.innerText = running ? 'Cancel' : 'Start'

  startStopButton.onclick = async (event) => {
    const running = await storage.isExtensionRunning()

    if (running) {
      timer.cancel()
      stopExtension()
      enableDurationInputs()
      event.target.innerText = 'Start'
    } else {
      timer.start()
      startExtension()
      disableDurationInputs()
      event.target.innerText = 'Cancel'
    }
  }

  const onFinish = async () => {
    const { restDuration } = await storage.getTimerProperties()

    setTimeout(async () => {
      if (await storage.isExtensionRunning()) timer.start() // TODO: replace with alarms array?
    }, restDuration)
  }

  const timer = new Timer(
    timerDuration,
    restDuration,
    currentPeriodProgress,
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

  const {
    maxTimerDuration,
    minTimerDuration,
    timerDurationIncrement,
    maxRestDuration,
    minRestDuration,
    restDurationIncrement,
  } = timerInputDefaults

  document.querySelector('.timer-duration-increment-up').onclick = async () => {
    const { timerDuration } = await storage.getTimerProperties()

    const newDuration = Math.min(
      maxTimerDuration,
      timerDuration + timerDurationIncrement
    )

    const rounded =
      Math.ceil(newDuration / timerDurationIncrement) * timerDurationIncrement

    setTimerDurationInputText(rounded)
    timer.setTimerDuration(rounded)
    storage.setTimerDuration(rounded)
  }

  document.querySelector('.timer-duration-increment-down').onclick =
    async () => {
      const { timerDuration } = await storage.getTimerProperties()

      const newDuration = Math.max(
        minTimerDuration,
        timerDuration - timerDurationIncrement
      )

      const rounded =
        Math.ceil(newDuration / timerDurationIncrement) * timerDurationIncrement

      setTimerDurationInputText(rounded)
      timer.setTimerDuration(rounded)
      storage.setTimerDuration(rounded)
    }

  document.querySelector('.rest-duration-increment-up').onclick = async () => {
    const { restDuration } = await storage.getTimerProperties()

    const newDuration = Math.min(
      maxRestDuration,
      restDuration + restDurationIncrement
    )

    const rounded =
      Math.ceil(newDuration / restDurationIncrement) * restDurationIncrement

    setRestDurationInputText(rounded)
    storage.setRestDuration(rounded)
  }

  document.querySelector('.rest-duration-increment-down').onclick =
    async () => {
      const { restDuration } = await storage.getTimerProperties()

      const newDuration = Math.max(
        minRestDuration,
        restDuration - restDurationIncrement
      )

      const rounded =
        Math.ceil(newDuration / restDurationIncrement) * restDurationIncrement

      setRestDurationInputText(rounded)
      storage.setRestDuration(rounded)
    }

  const desktopNotificationCheckbox = document.querySelector(
    '#desktop-notification-checkbox'
  )

  desktopNotificationCheckbox.checked = pushDesktopNotification

  desktopNotificationCheckbox.onclick = (event) =>
    storage.setPushDesktopNotification(event.target.checked)

  const soundNotificationCheckbox = document.querySelector(
    '#sound-notification-checkbox'
  )
  soundNotificationCheckbox.checked = playSoundNotification
  soundNotificationCheckbox.onclick = (event) =>
    storage.setPlaySoundNotification(event.target.checked)

  // open testing popup in dev environment
  chrome.management.getSelf((info) => {
    if (info.installType !== 'development') return
    createDevUI()
  })
}

window.onload = onPopupLoad
