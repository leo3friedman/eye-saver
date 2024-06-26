const states = {
  RUNNING: 0,
  DONE: 1,
  STOPPED: 2,
}

const DEFAULTS = {
  width: 200,
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
   * @param {Node} actionButton A button to render on the timer
   */
  constructor(
    timerDuration,
    restDuration,
    timePassed = 0,
    running = true,
    countdown = true,
    callback = null,
    actionButton = null
  ) {
    this.timerDuration = timerDuration
    this.restDuration = restDuration
    this.timePassed = running ? timePassed : 0
    this.state = running ? states.RUNNING : states.STOPPED
    this.countdown = countdown
    this.callback = callback
    this.actionButton = actionButton
    this.timestamp = -1
  }

  renderTimer(container) {
    if (!container) throw Error('Container needed to render timer!')
    
    const timerTemplateUrl = chrome.runtime.getURL('src/timer.html')
    const xhr = new XMLHttpRequest()

    xhr.onload = () => {
      container.insertAdjacentHTML('afterbegin', xhr.response)

      this.circle = document.querySelector('.progress-ring__circle')

      const timer = document.querySelector('.timer')
      const { width } = timer ? timer.getBoundingClientRect() : DEFAULTS
      this.circumference = width * Math.PI

      this.hoursDisplay = document.querySelector('.timer-duration__hours')
      this.minutesDisplay = document.querySelector('.timer-duration__minutes')
      this.secondsDisplay = document.querySelector('.timer-duration__seconds')

      const actionButtonDropzone = document.querySelector(
        '.action-button-dropzone'
      )

      if (actionButtonDropzone && this.actionButton)
        actionButtonDropzone.insertAdjacentElement(
          'afterbegin',
          this.actionButton
        )

      this.setTimerText()
      this.setProgress()

      if (this.state == states.RUNNING) {
        this.timestamp = Date.now()
        this.tick()
      }
    }
    xhr.open('GET', timerTemplateUrl)
    xhr.send()
  }

  start() {
    this.stopBlinking()
    this.timePassed = 0
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
    this.setProgress(100)
    this.setTimerText(0)
    this.startBlinking()
    if (this.callback) {
      this.callback()
    }
  }

  tick() {
    if (this.state === states.DONE || this.state === states.STOPPED) {
      return
    }

    this.stopBlinking() // TODO: this shouldn't be needed (added for blinking bug fix)

    this.timePassed += Date.now() - this.timestamp
    this.timestamp = Date.now()

    this.setProgress()
    this.setTimerText()

    if (this.timerDuration - this.timePassed < 0) {
      this.finish()
      return
    }

    window.requestAnimationFrame(() => this.tick())
  }

  setProgress(percent = null) {
    if (percent === null) {
      percent = Math.min((this.timePassed / this.timerDuration) * 100, 100)
    }

    const adjPercent = this.countdown ? 100 - percent : percent
    const circumference = this.circumference

    const offset = circumference - (adjPercent / 100) * circumference

    if (this.circle) this.circle.style.strokeDashoffset = offset
  }

  setTimerText(timeRemaining = null) {
    if (timeRemaining === null) {
      timeRemaining = Math.max(this.timerDuration - this.timePassed, 0)
    }
    const clockTime = this.countdown ? timeRemaining : this.timePassed
    const date = new Date(0, 0, 0, 0, 0, 0, clockTime)

    const seconds = ('0' + date.getSeconds()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const hours = date.getHours()

    if (this.hoursDisplay) this.hoursDisplay.innerText = hours
    if (this.minutesDisplay) this.minutesDisplay.innerText = minutes
    if (this.secondsDisplay) this.secondsDisplay.innerText = seconds
  }

  setTimerDuration(duration) {
    this.timePassed = duration * (this.timePassed / this.timerDuration)
    this.timerDuration = duration
    this.setTimerText()
  }

  setRestDuration(duration) {
    this.restDuration = duration
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
