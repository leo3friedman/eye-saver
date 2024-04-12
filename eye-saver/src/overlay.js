let alarmHandler = null

async function skipRest() {
  removeOverlay()
  alarmHandler.clearAlarms()
  alarmHandler.createTimerAlarm(onAlarm)

  const { messageKeys } = await import(chrome.runtime.getURL('src/messages.js'))
  chrome.runtime.sendMessage({ key: messageKeys.SKIP_REST })
}

async function onAlarm() {
  const { getTimerProperties } = await import(
    chrome.runtime.getURL('src/storage.js')
  )

  const { timerDuration, restDuration } = await getTimerProperties()

  const restDurationRemaining = await alarmHandler.getRestDurationRemaining()
  const restDurationPassed = restDuration - restDurationRemaining

  const rootSelector = await addOverlay()

  renderClock(rootSelector, timerDuration, restDuration, restDurationPassed)

  alarmHandler.createSimpleAlarm(removeOverlay, restDurationRemaining)
}

function removeOverlay() {
  document
    .querySelectorAll('.eye-saver-overlay-host')
    .forEach((overlay) => document.body.removeChild(overlay))
}

function isOverlayOn() {
  return document.querySelectorAll('.eye-saver-overlay-host').length > 0
}

async function addOverlay() {
  if (isOverlayOn()) return

  const host = document.createElement('div')
  host.className = 'eye-saver-overlay-host'

  const shadow = host.attachShadow({ mode: 'open' })

  document.body.appendChild(host)

  const response = await fetch(chrome.runtime.getURL('src/overlay.html'))
  const html = await response.text()
  shadow.innerHTML = html

  host.shadowRoot.querySelector('.eye-saver-skip-button').onclick = skipRest

  return host.shadowRoot
}

async function renderClock(
  rootSelector,
  timerDuration,
  restDuration,
  timePassed
) {
  const timerSrc = await import(chrome.runtime.getURL('src/timer.js'))

  const timer = new timerSrc.Timer(
    restDuration,
    timerDuration,
    rootSelector,
    timePassed,
    true,
    false,
    null,
    null
  )
  try {
    timer.renderTimer()
  } catch (err) {
    console.error(err)
  }
}

const onPageLoad = async () => {
  const { storage } = await import(chrome.runtime.getURL('src/storage.js'))

  const { injectFonts } = await import(chrome.runtime.getURL('src/fonts.js'))
  if (!document.querySelector('.eye-saver-fonts')) injectFonts()

  const { AlarmHandler } = await import(chrome.runtime.getURL('src/alarms.js'))

  alarmHandler = new AlarmHandler(storage)

  alarmHandler.createTimerAlarm(onAlarm)

  // Render clock if already resting
  const isResting = await alarmHandler.isResting()

  if (isResting) onAlarm()
}

function onStorageChange(changes) {
  if (!changes.sessionStart) return

  removeOverlay()
  alarmHandler.clearAlarms()

  if (changes.sessionStart.newValue > 0) alarmHandler.createTimerAlarm(onAlarm)
}

chrome.storage.onChanged.addListener(onStorageChange)
window.onload = onPageLoad
