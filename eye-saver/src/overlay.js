const timeouts = []

async function skipRest() {
  removeOverlay()
  const { messages } = await import(chrome.runtime.getURL('src/enums.js'))
  chrome.runtime.sendMessage({ key: messages.SKIP_REST })
}

async function onAlarm() {
  timeouts.map((timeout) => clearTimeout(timeout))

  const { getTimerProperties } = await import(
    chrome.runtime.getURL('src/storage.js')
  )

  const { sessionStart, timerDuration, restDuration } =
    await getTimerProperties()

  if (sessionStart < 0) return

  const periodLength = timerDuration + restDuration
  const currentPeriodProgress = (Date.now() - sessionStart) % periodLength
  const timeUntilNextAlarm = timerDuration - currentPeriodProgress
  const restTimePassed = timeUntilNextAlarm < 0 ? timeUntilNextAlarm * -1 : 0

  const dropzone = addOverlay()
  renderClock(dropzone, timerDuration, restDuration, restTimePassed)
  const restDurationRemaining = Math.max(restDuration - restTimePassed, 0)

  const removeOverlayTimeout = setTimeout(removeOverlay, restDurationRemaining) // destroy overlay on restDuration end
  const alarmTimeout = setTimeout(
    onAlarm,
    timerDuration + restDurationRemaining
  )

  timeouts.push(removeOverlayTimeout, alarmTimeout)
}

function removeOverlay() {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

function isOverlayOn() {
  return document.querySelectorAll('.eye-saver__overlay').length > 0
}

function addOverlay() {
  if (isOverlayOn()) return

  const overlay = document.createElement('div')
  overlay.className = 'eye-saver__overlay'

  const overlayContents = document.createElement('div')
  overlayContents.className = 'eye-saver__overlay-contents'

  const dropzone = document.createElement('dropzone')
  dropzone.className = 'timer__dropzone'

  const skipButton = document.createElement('div')
  skipButton.className = 'eye-saver__skip-button'

  skipButton.innerText = 'Skip'
  skipButton.onclick = skipRest

  overlay.appendChild(overlayContents)
  overlayContents.appendChild(dropzone)
  overlayContents.appendChild(skipButton)
  document.body.appendChild(overlay)

  return dropzone
}

async function renderClock(dropzone, timerDuration, restDuration, timePassed) {
  const timerSrc = await import(chrome.runtime.getURL('src/timer.js'))

  const timer = new timerSrc.Timer(
    restDuration,
    timerDuration,
    timePassed,
    true,
    false,
    null,
    null
  )

  timer.renderTimer(dropzone)
}

const onPageLoad = async () => {
  timeouts.map((timeout) => clearTimeout(timeout))

  const { injectFonts } = await import(chrome.runtime.getURL('src/fonts.js'))
  if (!document.querySelector('.eye-saver-fonts')) injectFonts()

  const { getTimerProperties } = await import(
    chrome.runtime.getURL('src/storage.js')
  )

  const { sessionStart, timerDuration, restDuration } =
    await getTimerProperties()

  if (sessionStart < 0) return

  const periodLength = timerDuration + restDuration
  const currentPeriodProgress = (Date.now() - sessionStart) % periodLength
  const timeUntilNextAlarm = timerDuration - currentPeriodProgress

  const alarmTimeout = setTimeout(onAlarm, Math.max(timeUntilNextAlarm, 0))
  timeouts.push(alarmTimeout)
}

function onStorageChange(changes) {
  if (!changes.sessionStart) return

  timeouts.map((timeout) => clearTimeout(timeout))
  removeOverlay()

  if (changes.sessionStart.newValue > 0) onPageLoad() // set up new alarm
}

chrome.storage.onChanged.addListener(onStorageChange)
window.onload = onPageLoad
