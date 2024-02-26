const main = async () => {
  const { Timer } = await import(chrome.runtime.getURL('templates/timer.js'))
  const { injectFonts } = await import(chrome.runtime.getURL('fonts.js'))
  const { StorageManager } = await import(
    chrome.runtime.getURL('storageManager.js')
  )

  injectFonts()

  /**
   * RENDERING THE TIMER
   */

  const storage = new StorageManager(chrome)
  const timerDuration = await storage.getTimerDuration()
  const restDuration = await storage.getRestDuration()
  const timeRemaining = await storage.getTimeUntilAlarm()
  const isRunning = await storage.getIsRunning()
  const { messages } = await storage.getEnums()

  const startStopButton = document.createElement('div')
  startStopButton.onmouseover = (event) => {
    event.target.style.cursor = 'pointer'
  }

  startStopButton.innerText = isRunning ? 'Cancel' : 'Start'
  startStopButton.onclick = async (event) => {
    if (await storage.getIsRunning()) {
      this.chrome.runtime.sendMessage({
        key: messages.STOP,
      })
      enableDurationInputs()
      timer.cancel()
      event.target.innerText = 'Start'
    } else {
      this.chrome.runtime.sendMessage({
        key: messages.START,
      })
      disableDurationInputs()
      timer.start()
      event.target.innerText = 'Cancel'
    }
  }

  const onFinish = async () => {
    const restDuration = await storage.getRestDuration()
    const restDurationRemaining = await storage.getRestDurationRemaining()
    const restartDelay =
      restDurationRemaining > 0 ? restDurationRemaining : restDuration

    // TODO: message service_worker to trigger alarm

    setTimeout(
      async () => (await storage.getIsRunning()) && timer.start(),
      restartDelay
    )
  }

  const timer = new Timer(
    timerDuration,
    timeRemaining,
    isRunning,
    true,
    onFinish,
    startStopButton
  )

  timer.renderTimer(document.querySelector('.timer__dropzone'))

  /**
   * INITIALIZING UI ELEMENTS
   */

  setTimerDurationInputText(timerDuration)
  setRestDurationInputText(restDuration)

  isRunning ? disableDurationInputs() : enableDurationInputs()

  document.querySelector('.timer-duration-increment-up').onclick = async () => {
    const newTimerDuration = await storage.incrementTimerDuration(true)
    setTimerDurationInputText(newTimerDuration)
    timer.setTimerDuration(newTimerDuration)
  }

  document.querySelector('.timer-duration-increment-down').onclick =
    async () => {
      const newTimerDuration = await storage.incrementTimerDuration(false)
      setTimerDurationInputText(newTimerDuration)
      timer.setTimerDuration(newTimerDuration)
    }

  document.querySelector('.rest-duration-increment-up').onclick = async () => {
    const newRestDuration = await storage.incrementRestDuration(true)
    setRestDurationInputText(newRestDuration)
  }

  document.querySelector('.rest-duration-increment-down').onclick =
    async () => {
      const newRestDuration = await storage.incrementRestDuration(false)
      setRestDurationInputText(newRestDuration)
    }

  const desktopNotificationCheckbox = document.querySelector(
    '#desktop-notification-checkbox'
  )
  const soundNotificationCheckbox = document.querySelector(
    '#sound-notification-checkbox'
  )
  desktopNotificationCheckbox.checked =
    await storage.getPushDesktopNotification()
  desktopNotificationCheckbox.onclick = async (event) => {
    storage.setPushDesktopNotification(event.target.checked)
  }
  soundNotificationCheckbox.checked = await storage.getPlaySoundNotification()
  soundNotificationCheckbox.onclick = async (event) => {
    storage.setPlaySoundNotification(event.target.checked)
  }

  /**
   * INITIALIZING DEV/TESTING UI
   */
  loadTestingUI()
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

async function loadTestingUI() {
  const { injectDevUI } = await import(
    chrome.runtime.getURL('templates/devUI.js')
  )

  chrome.management.getSelf((info) => {
    if (info.installType !== 'development') return
    const devUIURL = chrome.runtime.getURL('templates/devUI.html')
    injectDevUI(devUIURL)
  })
}

window.onload = main
