export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   */
  constructor(chrome, onResting = null) {
    this.chrome = chrome
    this.timeout = null
    this.onResting = onResting

    chrome.runtime.onMessage.addListener(async (message) => {
      if (!this.enums) await this.importEnums()
      if (message === this.enums.messages.ACTIVATE) {
        this.restIfPossible()
      }
    })
  }

  restOnTimeout(timeUntilNextRest) {
    console.log('restOnTimeout time until next rest:', timeUntilNextRest)
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = window.setTimeout(
      () => this.restIfPossible(),
      timeUntilNextRest
    )
  }

  async restIfPossible() {
    const running = await this.isExtensionRunning()
    const resting = await this.isResting()
    console.log(
      `restIfPossible() --> isRunning? ${running}, isResting? ${resting}`
    )
    if (running && resting && this.onResting != null) {
      const restDurationRemaining = await this.getRestDurationRemaining()
      this.onResting(restDurationRemaining)
    }
    const timeUntilNextRest = await this.getTimeUntilNextRest()
    console.log('restOnTimeout time until next rest:', timeUntilNextRest)
    this.restOnTimeout(timeUntilNextRest)
  }

  stopExtension() {
    if (this.timeout) clearTimeout(this.timeout)
  }

  startExtension() {
    this.restIfPossible()
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

    // return new Promise((resolve) => {
    //   this.chrome.storage.sync.get(this.enums.defaults, (result) => {
    //     const sessionStart = Number(result.sessionStart)
    //     const timerDuration = Number(result.timerDuration)
    //     const restDuration = Number(result.restDuration)

    //     const currentProgress =
    //       (Date.now() - sessionStart) % (timerDuration + restDuration)

    //     resolve(currentProgress >= timerDuration)
    //   })
    // })
  }

  async getCurrentProgress() {
    if (!this.enums) await this.importEnums()

    const sessionStart = await this.getSessionStart()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()

    return (Date.now() - sessionStart) % (timerDuration + restDuration)

    // return new Promise((resolve) => {
    //   this.chrome.storage.sync.get(this.enums.defaults, (result) => {
    //     const sessionStart = await this.getSessionStart()
    //     const timerDuration = Number(result.timerDuration)
    //     const restDuration = Number(result.restDuration)

    //     resolve((Date.now() - sessionStart) % (timerDuration + restDuration))
    //   })
    // })
  }

  async getTimeUntilNextRest() {
    if (!this.enums) await this.importEnums()

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()
    const resting = await this.isResting()

    console.log(
      `getTimeUnitleNextRest() --> CP: ${currentProgress}, TD: ${timerDuration}, RD: ${restDuration}, Resting: ${resting}`
    )
    if (!resting) {
      console.log(
        'getTimeUntilNextRest() returning (1) -->',
        timerDuration - currentProgress
      )
      return timerDuration - currentProgress
    }
    console.log(
      'getTimeUntilNextRest() returning (1) -->',
      restDuration - (currentProgress - timerDuration) + timerDuration
    )
    return restDuration - (currentProgress - timerDuration) + timerDuration

    // if (resting) {
    //   const timerDuration = await this.getTimerDuration()
    //   const restDuration = await this.getRestDuration()
    //   return restDuration - (currentProgress - timerDuration) + timerDuration
    // } else {
    //   const timerDuration = await this.getTimerDuration()
    //   return timerDuration - currentProgress
    // }

    // return new Promise((resolve) => {
    //   this.chrome.storage.sync.get(this.enums.defaults, (result) => {
    //     const sessionStart = Number(result.sessionStart)
    //     const timerDuration = Number(result.timerDuration)
    //     const restDuration = Number(result.restDuration)

    //     const currentProgress =
    //       (Date.now() - sessionStart) % (timerDuration + restDuration)

    //     if (currentProgress >= timerDuration) {
    //       resolve(
    //         restDuration - (currentProgress - timerDuration) + timerDuration
    //       )
    //     } else {
    //       resolve(timerDuration - currentProgress)
    //     }
    //   })
    // })
  }

  async getRestDurationRemaining() {
    if (!this.enums) await this.importEnums()

    const resting = await this.isResting()

    if (!resting) return 0

    const currentProgress = await this.getCurrentProgress()
    const timerDuration = await this.getTimerDuration()
    const restDuration = await this.getRestDuration()

    return restDuration - (currentProgress - timerDuration)

    // return new Promise((resolve) => {
    //   this.chrome.storage.sync.get(this.enums.defaults, (result) => {
    //     const sessionStart = Number(result.sessionStart)
    //     const timerDuration = Number(result.timerDuration)
    //     const restDuration = Number(result.restDuration)

    //     const currentProgress =
    //       (Date.now() - sessionStart) % (timerDuration + restDuration)

    //     if (currentProgress >= timerDuration) {
    //       resolve(restDuration - (currentProgress - timerDuration))
    //     } else {
    //       resolve(0)
    //     }
    //   })
    // })
  }

  async importEnums() {
    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }
}
