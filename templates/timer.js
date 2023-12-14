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
   */
  constructor(duration, countdown) {
    this.props = {}
    this.timestamp = -1
    this.timePassed = -1
    this.state = states.DONE
    this.duration = duration
    this.countdown = countdown
  }

  renderTimer(container) {
    const timerTemplateUrl = chrome.runtime.getURL('templates/timer.html')
    const xhr = new XMLHttpRequest()

    xhr.onload = () => {
      container?.insertAdjacentHTML('afterbegin', xhr.response)
      this.initializeProps()
      this.initializeRings()
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

    this.props = {
      height: timerDims.height,
      width: timerDims.width,
      radius: timerDims.width / 2,
      circumference: timerDims.width * Math.PI,
      strokeWidth: 4,
      progressRing: progressRing,
      circle: circle,
      background: background,
    }
  }

  initializeRings() {
    const props = this.props
    // TODO: how could timer not be available yet?
    // TODO: throw exception/error?
    if (Object.values(props).includes(null) || Object.keys(props).length == 0) {
      console.log('invalid props')
      return
    }

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
  }

  tick() {
    if (this.state == states.PAUSED || this.state == states.DONE) return
    this.timePassed += Date.now() - this.timestamp
    this.timestamp = Date.now()

    const percentFinished = (this.timePassed / this.duration) * 100
    this.setProgress(Math.max(percentFinished, 0))

    if (this.duration - this.timePassed < 0) {
      this.state == states.DONE
    }

    window.requestAnimationFrame(() => this.tick())
  }

  setProgress(percent) {
    const adjPercent = this.countdown ? 100 - percent : percent
    const circumference = this.props.circumference

    const offset = circumference - (adjPercent / 100) * circumference
    this.props.circle.style.strokeDashoffset = offset
  }
}
