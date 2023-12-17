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
    const isResting = await this.isResting()
    console.log('restIfPossible() --> isResting?', isResting)
    if (isResting && this.onResting != null) {
      const restDurationRemaining = await this.getRestDurationRemaining()
      this.onResting(await restDurationRemaining)
    }
    const timeUntilNextRest = await this.getTimeUntilNextRest()
    console.log('restOnTimeout time until next rest:', timeUntilNextRest)
    this.restOnTimeout(timeUntilNextRest)
  }

  async isResting() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        const sessionStart = Number(result.sessionStart)
        const timerDuration = Number(result.timerDuration)
        const restDuration = Number(result.restDuration)

        const currentProgress =
          (Date.now() - sessionStart) % (timerDuration + restDuration)

        resolve(currentProgress >= timerDuration)
      })
    })
  }

  async getTimeUntilNextRest() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        const sessionStart = Number(result.sessionStart)
        const timerDuration = Number(result.timerDuration)
        const restDuration = Number(result.restDuration)

        const currentProgress =
          (Date.now() - sessionStart) % (timerDuration + restDuration)

        if (currentProgress >= timerDuration) {
          resolve(
            restDuration - (currentProgress - timerDuration) + timerDuration
          )
        } else {
          resolve(timerDuration - currentProgress)
        }
      })
    })
  }

  async getRestDurationRemaining() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        const sessionStart = Number(result.sessionStart)
        const timerDuration = Number(result.timerDuration)
        const restDuration = Number(result.restDuration)

        const currentProgress =
          (Date.now() - sessionStart) % (timerDuration + restDuration)

        if (currentProgress >= timerDuration) {
          resolve(restDuration - (currentProgress - timerDuration))
        } else {
          resolve(0)
        }
      })
    })
  }

  setSessionStart() {
    this.chrome.storage.sync.set({ sessionStart: Date.now() })
  }

  async importEnums() {
    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }
}
