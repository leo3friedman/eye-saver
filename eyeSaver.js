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
        // this.restIfPossible()
        this.handleCurrentState()
      }
    })

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.state) this.handleCurrentState()
    })
  }

  async handleCurrentState() {
    const running = await this.isExtensionRunning()
    const resting = await this.isResting()

    console.log(
      'handling current state --> running: ',
      running,
      'resting: ',
      resting
    )

    if (!running) {
      console.log('handle response --> STOPPED, remove overlay in case')
      if (this.onScreenTime) this.onScreenTime()
      return
    }

    // TOOD: should we be passing in a window to the constructor?
    this.timeout = window.setTimeout(
      () => this.handleCurrentState(),
      await this.getTimeUntilNextStateChange()
    )

    if (resting) {
      console.log('handle response --> RESTING, run onResting')
      if (this.onResting) this.onResting()
    }

    if (!resting && this.onScreenTime) {
      console.log('handle response --> RUNNING, run onBreaking')
      if (this.onScreenTime) this.onScreenTime()
    }
  }

  async startExtension() {
    console.log('starting extension')
    await chrome.storage.sync.set({ sessionStart: Date.now() })
    await chrome.storage.sync.set({ state: props.states.RUNNING })
    // this.restIfPossible()
    // this.handleCurrentState()
  }

  async stopExtension() {
    console.log('stopping extension')
    if (this.timeout) clearTimeout(this.timeout)
    await chrome.storage.sync.set({ state: props.states.STOPPED })
    // this.handleCurrentState()
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
    if (!this.enums) await this.importEnums()
    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    return currentProgress >= timerDuration
  }

  async getTimeUntilNextStateChange() {
    const resting = await this.isResting()

    if (resting) return await this.getRestDurationRemaining()

    return await this.getTimerDurationRemaining()
  }

  async getCurrentProgress() {
    if (!this.enums) await this.importEnums()

    const sessionStart = await this.getSessionStart()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()

    return (Date.now() - sessionStart) % (timerDuration + restDuration)
  }

  async getTimeUntilNextRest() {
    if (!this.enums) await this.importEnums()

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()
    const resting = await this.isResting()

    if (!resting) {
      return timerDuration - currentProgress
    }
    return restDuration - (currentProgress - timerDuration) + timerDuration
  }

  async getRestDurationRemaining() {
    if (!this.enums) await this.importEnums()

    const resting = await this.isResting()

    if (!resting) return 0

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()

    return restDuration - (currentProgress - timerDuration)
  }

  async getTimerDurationRemaining() {
    if (!this.enums) await this.importEnums()

    const resting = await this.isResting()

    if (resting) return 0

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()

    return timerDuration - currentProgress
  }

  async importEnums() {
    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }

  // restOnTimeout(timeUntilNextRest) {
  //   console.log('restOnTimeout time until next rest:', timeUntilNextRest)
  //   if (this.timeout) clearTimeout(this.timeout)
  //   this.timeout = window.setTimeout(
  //     () => this.restIfPossible(),
  //     timeUntilNextRest
  //   )
  // }

  // async restIfPossible() {
  //   const running = await this.isExtensionRunning()
  //   const resting = await this.isResting()

  //   if (running && resting && this.onResting != null) {
  //     const restDurationRemaining = await this.getRestDurationRemaining()
  //     this.onResting(restDurationRemaining)
  //   } else {
  //     this.onBreaking()
  //   }
  //   const timeUntilNextRest = await this.getTimeUntilNextRest()
  //   this.restOnTimeout(timeUntilNextRest)
  // }
}
