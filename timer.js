let progress = 0
let properties = {}
let elements = {}
let timePassed = -1
let timestamp = -1

const defaults = {
  timerDuration: 10 * 1000,
  breakDuration: 5 * 1000,
}

window.onload = () => {
  const timer = document.querySelector('.timer')
  const timerButton = document.querySelector('.timer-button')

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

  timerButton.onclick = () => {
    console.log('clicked')
    if (!isTimerRunning()) {
      console.log('STARTING TIMER')
      startTimer()
    }
  }
}

const setProgress = (percent) => {
  console.log('percent:', percent)
  const offset =
    properties.circumference - (percent / 100) * properties.circumference
  console.log(offset)
  elements.circle.style.strokeDashoffset = offset
}

const isTimerRunning = () => {
  return timestamp >= 0 && timePassed >= 0
}

const startTimer = () => {
  timePassed = 0
  timestamp = Date.now()
  tick()
}

const tick = () => {
  timePassed += Date.now() - timestamp
  timestamp = Date.now()

  if (defaults.length - timePassed < 0) {
    console.log('ENDING')
    return
  }

  const progress = Math.max(
    100 - (timePassed / defaults.timerDuration) * 100,
    0
  )
  setProgress(progress)
  window.requestAnimationFrame(tick)
}
