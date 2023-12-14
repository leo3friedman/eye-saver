let progress = 0
let properties = {}
let elements = {}
let timePassed = -1
let timestamp = -1

const defaults = {
  timerDuration: 10 * 1000,
  breakDuration: 5 * 1000,
}

const initializeRings = () => {
  const timer = document.querySelector('.timer')

  // TODO: how could timer not be available yet?
  if (!timer) return

  const timerDims = timer.getBoundingClientRect()
  properties = {
    height: timerDims.height,
    width: timerDims.width,
    radius: timerDims.width / 2,
    circumference: timerDims.width * Math.PI,
    strokeWidth: 4,
  }

  const progressRings = document.querySelectorAll('.progress-ring')
  const circle = document.querySelector('.progress-ring__circle')
  elements.circle = circle
  const background = document.querySelector('.progress-ring__background')
  elements.background = background

  progressRings.forEach((ring) => {
    ring.style.height = properties.height
    ring.style.width = properties.width
  })

  circle.setAttribute('stroke-width', properties.strokeWidth)
  circle.setAttribute('r', properties.radius)
  circle.setAttribute('cx', properties.radius)
  circle.setAttribute('cy', properties.radius)

  background.setAttribute('stroke-width', properties.strokeWidth)
  background.setAttribute('r', properties.radius)
  background.setAttribute('cx', properties.radius)
  background.setAttribute('cy', properties.radius)

  circle.style.strokeDasharray = `${properties.circumference} ${properties.circumference}`
}

export const renderTimer = (container) => {
  const timerTemplateUrl = chrome.runtime.getURL('templates/timer.html')
  const xhr = new XMLHttpRequest()

  xhr.onload = () => {
    console.log(xhr.response)
    console.log(container)
    container?.insertAdjacentHTML('afterbegin', xhr.response)
    initializeRings()
  }
  xhr.open('GET', timerTemplateUrl)
  xhr.send()
}

const startTimer = (length, countdown = true) => {
  timePassed = 0
  timestamp = Date.now()

  const tick = () => {
    timePassed += Date.now() - timestamp
    timestamp = Date.now()

    const percentFinished = (timePassed / defaults.timerDuration) * 100
    const progress = countdown ? 100 - percentFinished : percentFinished
    setProgress(Math.max(progress, 0))
    if (defaults.timerDuration - timePassed < 0) {
      timePassed = -1
      timestamp = -1
      return
    }

    window.requestAnimationFrame(tick)
  }
  tick()
}

const setProgress = (percent) => {
  const offset =
    properties.circumference - (percent / 100) * properties.circumference
  elements.circle.style.strokeDashoffset = offset
}

const isTimerRunning = () => {
  return timestamp >= 0 && timePassed >= 0
}
