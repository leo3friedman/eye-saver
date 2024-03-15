let alarmHandler = null

async function skipRest() {
  removeOverlay()
  alarmHandler.clearAlarms()
  alarmHandler.createTimerAlarm(onAlarm)

  const { messages } = await import(chrome.runtime.getURL('src/enums.js'))
  chrome.runtime.sendMessage({ key: messages.SKIP_REST })
}

async function onAlarm() {
  const { getTimerProperties } = await import(
    chrome.runtime.getURL('src/storage.js')
  )

  const { timerDuration, restDuration } = await getTimerProperties()

  const restDurationRemaining = await alarmHandler.getRestDurationRemaining()
  const restDurationPassed = restDuration - restDurationRemaining

  const clockDropzone = addOverlay()

  renderClock(clockDropzone, timerDuration, restDuration, restDurationPassed)

  alarmHandler.createSimpleAlarm(removeOverlay, restDurationRemaining)
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
  try {
    timer.renderTimer(dropzone)
  } catch (err) {
    console.error(err)
  }
}

const onPageLoad = async () => {
  const { injectFonts } = await import(chrome.runtime.getURL('src/fonts.js'))
  if (!document.querySelector('.eye-saver-fonts')) injectFonts()

  const { storage } = await import(chrome.runtime.getURL('src/storage.js'))

  const { AlarmHandler } = await import(chrome.runtime.getURL('src/alarms.js'))

  alarmHandler = new AlarmHandler(storage)

  alarmHandler.createTimerAlarm(onAlarm)
}

function onStorageChange(changes) {
  if (!changes.sessionStart) return

  removeOverlay()
  alarmHandler.clearAlarms()

  if (changes.sessionStart.newValue > 0) alarmHandler.createTimerAlarm(onAlarm)
}

chrome.storage.onChanged.addListener(onStorageChange)
window.onload = onPageLoad
