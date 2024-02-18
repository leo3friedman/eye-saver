export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   * @param {()=>void} onScreenTime
   */
  constructor(chrome, onResting, onScreenTime) {
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

    if (!running) {
      if (this.onScreenTime) this.onScreenTime()
      return
    }

    // TOOD: should we be passing in a window to the constructor?
    this.timeout = window.setTimeout(
      () => this.handleCurrentState(),
      await this.getTimeUntilNextStateChange()
    )

    resting ? this.onResting() : this.onScreenTime()

    if (resting && (await this.shouldNotifyToLookAway())) {
      await this.setLastLookAway()
      this.pushDesktopNotification(true)
      this.playSound()
    }
    // else if (!resting && (await this.shouldNotifyToLookBack())) {
    //   await this.setLastLookBack()
    //   this.pushDesktopNotification(false)
    //   this.playSound()
    // }
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

  /**
   *
   * @param {boolean} isResting
   * @returns
   */
  async pushDesktopNotification(isResting) {
    const enabled = await this.getPushDesktopNotification()
    if ((await this.isFreshStart()) || !enabled) return
    if (!this.enums) await this.importEnums()

    const options = this.enums.notificationOptions
    const message = isResting
      ? options.lookAwayMessage
      : options.lookBackMessage

    this.chrome.runtime.sendMessage({
      key: this.enums.messages.PUSH_DESKTOP_NOTIFICATION,
      payload: {
        type: options.type,
        iconUrl: options.iconUrl,
        title: options.title,
        message: message,
      },
    })
  }

  async playSound() {
    const enabled = await this.getPlaySoundNotification()
    if ((await this.isFreshStart()) || !enabled) return
    if (!this.enums) await this.importEnums()

    const source = await this.getSoundSource()
    const volume = await this.getSoundVolume()

    chrome.runtime.sendMessage({
      key: this.enums.messages.PLAY_SOUND,
      payload: { source: source, volume: volume },
      offscreen: false,
    })
  }

  /**
   *
   * STORAGE SETTERS
   *
   */

  async setSessionStart() {
    await this.chrome.storage.sync.set({ sessionStart: Date.now() })
  }
  async setTimerDuration(duration) {
    await this.chrome.storage.sync.set({ timerDuration: duration })
  }
  async setRestDuration(duration) {
    await this.chrome.storage.sync.set({ restDuration: duration })
  }
  async setPushDesktopNotification(boolean) {
    await this.chrome.storage.sync.set({ pushDesktopNotification: boolean })
  }
  async setPlaySoundNotification(boolean) {
    await this.chrome.storage.sync.set({ playSoundNotification: boolean })
  }
  async setHasNotifiedLookAway(boolean) {
    await this.chrome.storage.sync.set({ hasNotifiedLookAway: boolean })
  }
  async setHasNotifiedLookBack(boolean) {
    await this.chrome.storage.sync.set({ hasNotifiedLookBack: boolean })
  }

  async setLastLookAway() {
    await this.chrome.storage.sync.set({ lastLookAway: Date.now() })
  }

  async setLastLookBack() {
    await this.chrome.storage.sync.set({ lastLookBack: Date.now() })
  }

  /**
   *
   * STORAGE GETTERS
   *
   */

  async shouldNotifyToLookAway() {
    const lastLookAway = await this.getLastLookAway()
    const timerDuration = await this.getTimerDuration()
    return Date.now() - lastLookAway >= timerDuration
  }

  async shouldNotifyToLookBack() {
    const lastLookBack = await this.getLastLookBack()
    const restDuration = await this.getRestDuration()
    const timerDuration = await this.getTimerDuration()
    return Date.now() - lastLookBack >= restDuration + timerDuration
  }

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

  async getSoundSource() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(String(result.soundSource))
      })
    })
  }

  async getSoundVolume() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.soundVolume))
      })
    })
  }
  async getPushDesktopNotification() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.pushDesktopNotification))
      })
    })
  }

  async getPlaySoundNotification() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.playSoundNotification))
      })
    })
  }

  async getHasNotifiedLookAway() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.hasNotifiedLookAway))
      })
    })
  }

  async getHasNotifiedLookBack() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.hasNotifiedLookBack))
      })
    })
  }

  async getLastLookAway() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.lastLookAway))
      })
    })
  }

  async getLastLookBack() {
    if (!this.enums) await this.importEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.lastLookBack))
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
