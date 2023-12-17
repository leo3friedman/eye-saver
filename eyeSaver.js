export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   */
  constructor(chrome, onResting = null) {
    this.chrome = chrome
    this.timeout = null

    chrome.runtime.onMessage.addListener(async (message) => {
      if (!this.enums) await this.importEnums()
      if (message === this.enums.messages.ACTIVATE) {
        this.restIfPossible(onResting)
      }
    })
  }

  restOnTimeout(onResting, timeUntilNextRest) {
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = window.setTimeout(
      () => this.restIfPossible(onResting),
      timeUntilNextRest
    )
  }

  async restIfPossible(onResting) {
    const isResting = await this.isResting()
    if (isResting && onResting != null) {
      const restDurationRemaining = await this.getRestDurationRemaining()
      onResting(restDurationRemaining)
    }
    const timeUntilNextRest = await this.getTimeUntilNextRest()
    this.restOnTimeout(onResting, timeUntilNextRest)
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
          resolve(0)
        } else {
          resolve(restDuration - (currentProgress - timerDuration))
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
