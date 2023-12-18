export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   * @param {()=>void} onScreenTime
   */
  constructor(chrome, onResting = null, onScreenTime = null) {
    this.chrome = chrome
    this.timeout = null
    this.onResting = onResting
    this.onScreenTime = onScreenTime

    chrome.runtime.onMessage.addListener(async (message) => {
      if (!this.enums) await this.importEnums()
      if (message === this.enums.messages.ACTIVATE) {
        this.handleCurrentState()
      }
    })

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.state) this.handleCurrentState()
    })
  }

  async handleCurrentState() {
    if (this.timeout) clearTimeout(this.timeout)
    const running = await this.isExtensionRunning()
    const resting = await this.isResting()

    console.log(
      'handling current state --> running: ',
      running,
      'resting: ',
      resting
    )

    if (!running) {
      if (this.onScreenTime) this.onScreenTime()
      return
    }

    // TOOD: should we be passing in a window to the constructor?
    this.timeout = window.setTimeout(
      () => this.handleCurrentState(),
      await this.getTimeUntilNextStateChange()
    )

    if (resting && this.onResting) {
      this.onResting()
      return
    }

    if (!resting && this.onScreenTime) {
      this.onScreenTime()
    }
  }

  async startExtension() {
    await chrome.storage.sync.set({ sessionStart: Date.now() })
    await chrome.storage.sync.set({ state: props.states.RUNNING })
  }

  async stopExtension() {
    await chrome.storage.sync.set({ state: props.states.STOPPED })
  }

  setSessionStart() {
    this.chrome.storage.sync.set({ sessionStart: Date.now() })
  }

  async getSessionStart() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.sessionStart))
      })
    })
  }

  async getTimerDuration() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.timerDuration))
      })
    })
  }

  async getRestDuration() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.restDuration))
      })
    })
  }

  async isExtensionRunning() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(result.state === this.enums.states.RUNNING)
      })
    })
  }

  async isResting() {
    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    return currentProgress >= timerDuration
  }

  async getTimeUntilNextStateChange() {
    return (await this.isResting())
      ? await this.getRestDurationRemaining()
      : await this.getTimerDurationRemaining()
  }

  async getCurrentProgress() {
    const sessionStart = await this.getSessionStart()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()

    return (Date.now() - sessionStart) % (timerDuration + restDuration)
  }

  async getRestDurationRemaining() {
    const resting = await this.isResting()

    if (!resting) return 0

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()

    return restDuration - (currentProgress - timerDuration)
  }

  async getTimerDurationRemaining() {
    const resting = await this.isResting()

    if (resting) return 0

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()

    return timerDuration - currentProgress
  }

  async importEnums() {
    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }
}
