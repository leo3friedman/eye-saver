export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   */
  constructor(chrome, onResting = null) {
    this.chrome = chrome

    chrome.runtime.onMessage.addListener(async (message) => {
      if (!this.enums) await this.importEnums()
      if (message === this.enums.messages.ACTIVATE) {
        this.restIfPossible(onResting)
      }
    })
  }

  async restIfPossible(onResting) {
    const restDurationRemaining = await this.getRestDurationRemaining()
    if (restDurationRemaining > 0 && onResting) {
      onResting(restDurationRemaining)
    }
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
        const isResting = currentProgress > timerDuration
        const restDurationRemaining = isResting
          ? restDuration - (currentProgress - timerDuration)
          : 0

        resolve(restDurationRemaining)
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
