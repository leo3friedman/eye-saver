const defaults = {
  timerDuration: 10 * 1000,
  breakDuration: 5 * 1000,
}

export class Timer {
  constructor() {
    this.props = {}
    this.timestamp = -1
    this.timePassed = -1
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

  startTimer(length, countdown) {
    this.timePassed = 0
    this.timestamp = Date.now()
    this.tick(countdown)
  }

  tick(countdown) {
    this.timePassed += Date.now() - this.timestamp
    this.timestamp = Date.now()

    const percentFinished = (this.timePassed / defaults.timerDuration) * 100
    const progress = countdown ? 100 - percentFinished : percentFinished
    this.setProgress(Math.max(progress, 0))
    if (defaults.timerDuration - this.timePassed < 0) {
      this.timePassed = -1
      this.timestamp = -1
      return
    }

    window.requestAnimationFrame(() => this.tick(countdown))
  }

  setProgress(percent) {
    const offset =
      this.props.circumference - (percent / 100) * this.props.circumference
    this.props.circle.style.strokeDashoffset = offset
  }
}
