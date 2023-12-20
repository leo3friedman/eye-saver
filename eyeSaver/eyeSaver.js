export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   * @param {()=>void} onScreenTime
   */
  constructor(chrome, onResting = null, onScreenTime = null) {
    this.chrome = chrome
    this.onResting = onResting
    this.onScreenTime = onScreenTime
    this.timeout = null

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.state || changes.sessionStart) this.handleCurrentState()
    })
  }

  /**
   *
   * ACTIONS
   *
   */

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

    if (resting) {
      this.onResting()
      this.pushDesktopNotification()
      return
    }

    if (!resting) {
      this.onScreenTime()
      this.pushDesktopNotification()
      return
    }
  }

  async startExtension() {
    if (!this.enums) await this.importEnums()
    this.setSessionStart()
    await chrome.storage.sync.set({ state: this.enums.states.RUNNING })
  }

  async stopExtension() {
    if (!this.enums) await this.importEnums()
    await chrome.storage.sync.set({ state: this.enums.states.STOPPED })
  }

  async importEnums() {
    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }

  async pushDesktopNotification() {
    if (await this.isFreshStart()) return
    if (!this.enums) await this.importEnums()
    const options = this.enums.notificationOptions
    const message = (await this.isResting())
      ? options.lookAwayMessage
      : options.lookBackMessage
    const notificationOptions = {
      type: options.type,
      iconUrl: options.iconUrl,
      title: options.title,
      message: message,
    }
    this.chrome.runtime.sendMessage({
      key: this.enums.messages.PUSH_DESKTOP_NOTIFICATION,
      payload: notificationOptions,
    })
  }

  /**
   *
   * STORAGE SETTERS
   *
   */

  setSessionStart() {
    this.chrome.storage.sync.set({ sessionStart: Date.now() })
  }
  setTimerDuration(duration) {
    this.chrome.storage.sync.set({ timerDuration: duration })
  }
  setRestDuration(duration) {
    this.chrome.storage.sync.set({ restDuration: duration })
  }

  /**
   *
   * STORAGE GETTERS
   *
   */

  async isFreshStart() {
    const sessionStart = await this.getSessionStart()
    const timerDuration = await this.getTimerDuration()
    const totalTimePassed = Date.now() - sessionStart

    return totalTimePassed < timerDuration
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
}
