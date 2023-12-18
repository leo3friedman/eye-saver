const states = {
  RUNNING: 0,
  PAUSED: 1,
  DONE: 2,
}

const height = 200

const dims = {
  height: height,
  width: height,
  radius: height / 2,
  circumference: height * Math.PI,
  strokeWidth: 3,
}

export class Timer {
  /**
   *
   * @param {Number} timerDuration timer duration in milliseconds
   * @param {Number} restDuration rest duration in milliseconds
   * @param {Number} timePassed time passed since timer start in milliseconds
   * @param {boolean} running true if the timer should be running by default
   * @param {boolean} countdown true if the timer should count from duration down to 0
   * @param {() => void} callback callback to run when timer finishes (on finish())
   */
  constructor(
    timerDuration,
    restDuration,
    timePassed = 0,
    running = true,
    countdown = true,
    callback = null
  ) {
    this.timerDuration = timerDuration
    this.restDuration = restDuration
    this.timePassed = running ? timePassed : 0
    console.log(running)
    this.state = running ? states.RUNNING : states.STOPPED
    this.countdown = countdown
    this.callback = callback

    this.props = {}
    this.timestamp = -1
  }

  renderTimer(container) {
    const timerTemplateUrl = chrome.runtime.getURL('templates/timer.html')
    const xhr = new XMLHttpRequest()

    xhr.onload = () => {
      container?.insertAdjacentHTML('afterbegin', xhr.response)
      this.initializeProps()
      this.initializeStyles()
      if (this.state === states.RUNNING || this.state === states.DONE) {
        console.log('STATE WAS RUNNING!')
        this.timestamp = Date.now()
        this.tick()
      }
    }
    xhr.open('GET', timerTemplateUrl)
    xhr.send()
  }

  initializeProps() {
    const timer = document.querySelector('.timer')
    const timerDims = timer.getBoundingClientRect()
    const progressRing = document.querySelector('.progress-ring')
    const circle = document.querySelector('.progress-ring__circle')
    const background = document.querySelector('.progress-ring__background')
    const hourDisplay = document.querySelector('.timer-duration__hours')
    const minuteDisplay = document.querySelector('.timer-duration__minutes')
    const secondDisplay = document.querySelector('.timer-duration__seconds')

    this.props = {
      height: timerDims.height,
      width: timerDims.width,
      radius: timerDims.width / 2,
      circumference: timerDims.width * Math.PI,
      strokeWidth: 3,
      progressRing: progressRing,
      circle: circle,
      background: background,
      hourDisplay: hourDisplay,
      minuteDisplay: minuteDisplay,
      secondDisplay: secondDisplay,
    }
  }

  initializeStyles() {
    const props = this.props
    // TODO: how could timer not be available yet?
    // TODO: throw exception/error?
    if (Object.values(props).includes(null) || Object.keys(props).length == 0) {
      console.log('invalid props')
      return
    }

    props.progressRing.style.width = props.width
    props.progressRing.style.height = props.height
    // props.progressRing.style.width = dims.width
    // props.progressRing.style.height = dims.height

    props.circle.setAttribute('stroke-width', props.strokeWidth)
    props.circle.setAttribute('r', props.radius)
    props.circle.setAttribute('cx', props.radius)
    props.circle.setAttribute('cy', props.radius)
    props.circle.style.strokeDasharray = `${props.circumference} ${props.circumference}`
    // props.circle.setAttribute('stroke-width', dims.strokeWidth)
    // props.circle.setAttribute('r', dims.radius)
    // props.circle.setAttribute('cx', dims.radius)
    // props.circle.setAttribute('cy', dims.radius)
    // props.circle.style.strokeDasharray = `${dims.circumference} ${dims.circumference}`

    props.background.setAttribute('stroke-width', props.strokeWidth)
    props.background.setAttribute('r', props.radius)
    props.background.setAttribute('cx', props.radius)
    props.background.setAttribute('cy', props.radius)
    // props.background.setAttribute('stroke-width', dims.strokeWidth)
    // props.background.setAttribute('r', dims.radius)
    // props.background.setAttribute('cx', dims.radius)
    // props.background.setAttribute('cy', dims.radius)

    this.setTimerText()
    this.setProgress()
  }

  start() {
    this.stopBlinking()
    if (this.state == states.RUNNING) return
    if (this.state == states.DONE) this.timePassed = 0
    this.timestamp = Date.now()
    this.state = states.RUNNING
    this.tick()
  }

  cancel() {
    this.state = states.STOPPED
    this.timePassed = 0
    this.stopBlinking()
    this.setProgress(0)
    this.setTimerText()
  }

  finish() {
    this.state = states.DONE
    this.startBlinking()
    if (this.callback) {
      this.callback()
    }
  }

  tick() {
    if (this.state === states.DONE || this.state === states.STOPPED) {
      return
    }

    this.timePassed += Date.now() - this.timestamp
    this.timestamp = Date.now()

    this.setProgress()
    this.setTimerText()

    if (this.timerDuration - this.timePassed < 0) {
      this.finish()
    }

    window.requestAnimationFrame(() => this.tick())
  }

  setProgress(percent = null) {
    percent =
      percent == null
        ? Math.min((this.timePassed / this.timerDuration) * 100, 100)
        : percent

    const adjPercent = this.countdown ? 100 - percent : percent
    const circumference = this.props.circumference
    // const circumference = dims.circumference

    const offset = circumference - (adjPercent / 100) * circumference
    this.props.circle.style.strokeDashoffset = offset
  }

  setTimerText() {
    const timeRemaining = Math.max(this.timerDuration - this.timePassed, 0)
    const clockTime = this.countdown ? timeRemaining : this.timePassed
    const date = new Date(0, 0, 0, 0, 0, 0, clockTime)

    const seconds = ('0' + date.getSeconds()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const hours = date.getHours()

    this.props.secondDisplay.innerText = seconds
    this.props.minuteDisplay.innerText = minutes
    this.props.hourDisplay.innerText = hours
  }

  setDuration(duration) {
    this.timePassed = duration * (this.timePassed / this.timerDuration)
    this.timerDuration = duration
    this.setTimerText()
  }

  startBlinking() {
    const timerText = document.querySelector('.timer-duration')
    if (timerText) timerText.classList.add('blink')
  }

  stopBlinking() {
    const timerText = document.querySelector('.timer-duration')
    if (timerText) timerText.classList.remove('blink')
  }
}
