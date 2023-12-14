const states = {
  RUNNING: 0,
  PAUSED: 1,
  DONE: 2,
}

export class Timer {
  /**
   *
   * @param {Number} duration timer duration in milliseconds
   * @param {boolean} countdown true if the timer should count from duration down to 0
   * @param {() => void} callback runs callback when timer finishes
   */
  constructor(duration, countdown = true, callback = null) {
    this.props = {}
    this.timestamp = -1
    this.timePassed = -1
    this.state = states.DONE
    this.duration = duration
    this.countdown = countdown
    this.callback = callback
  }

  renderTimer(container) {
    const timerTemplateUrl = chrome.runtime.getURL('templates/timer.html')
    const xhr = new XMLHttpRequest()

    xhr.onload = () => {
      container?.insertAdjacentHTML('afterbegin', xhr.response)
      this.initializeProps()
      this.initializeStyles()
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
      strokeWidth: 4,
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

    this.setTimerText()

    props.progressRing.style.width = props.width
    props.progressRing.style.height = props.height

    props.circle.setAttribute('stroke-width', props.strokeWidth)
    props.circle.setAttribute('r', props.radius)
    props.circle.setAttribute('cx', props.radius)
    props.circle.setAttribute('cy', props.radius)
    props.circle.style.strokeDasharray = `${props.circumference} ${props.circumference}`

    props.background.setAttribute('stroke-width', props.strokeWidth)
    props.background.setAttribute('r', props.radius)
    props.background.setAttribute('cx', props.radius)
    props.background.setAttribute('cy', props.radius)
  }

  start() {
    if (this.state == states.RUNNING) return
    if (this.state == states.DONE) this.timePassed = 0
    this.timestamp = Date.now()
    this.state = states.RUNNING
    this.tick()
  }

  pause() {
    this.state = states.PAUSED
  }

  reset() {
    this.timePassed = 0
    this.timestamp = Date.now()
    this.setProgress(0)
    this.setTimerText()
    if (this.state != states.PAUSED) this.state = states.RUNNING
    this.tick()
  }

  finish() {
    this.state = states.DONE
    if (this.callback) {
      this.callback()
    }
  }

  tick() {
    if (this.state === states.PAUSED || this.state === states.DONE) {
      return
    }

    this.timePassed += Date.now() - this.timestamp
    this.timestamp = Date.now()

    const percentFinished = (this.timePassed / this.duration) * 100
    this.setProgress(Math.min(percentFinished, 100))
    this.setTimerText()

    if (this.duration - this.timePassed < 0) {
      this.finish()
    }

    window.requestAnimationFrame(() => this.tick())
  }

  setProgress(percent) {
    const adjPercent = this.countdown ? 100 - percent : percent
    const circumference = this.props.circumference

    const offset = circumference - (adjPercent / 100) * circumference
    this.props.circle.style.strokeDashoffset = offset
  }

  setTimerText() {
    const timeRemaining = Math.max(this.duration - this.timePassed, 0)
    const date = new Date(0, 0, 0, 0, 0, 0, timeRemaining)

    const seconds = ('0' + date.getSeconds()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const hours = date.getHours()

    this.props.secondDisplay.innerText = seconds
    this.props.minuteDisplay.innerText = minutes
    this.props.hourDisplay.innerText = hours
  }
}
