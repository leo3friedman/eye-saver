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

    if (resting && !(await this.getHasNotifiedLookAway())) {
      await this.setHasNotifiedLookAway(true)
      await this.setHasNotifiedLookBack(false)
      this.playSound()
      this.pushDesktopNotification()
    } else if (!resting && !(await this.getHasNotifiedLookBack())) {
      await this.setHasNotifiedLookBack(true)
      await this.setHasNotifiedLookAway(false)
      this.playSound()
      this.pushDesktopNotification()
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
    const enabled = await this.getPushDesktopNotification()
    if ((await this.isFreshStart()) || !enabled) return
    if (!this.enums) await this.importEnums()

    const options = this.enums.notificationOptions
    const message = (await this.isResting())
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
    this.chrome.storage.sync.set({ sessionStart: Date.now() })
  }
  async setTimerDuration(duration) {
    this.chrome.storage.sync.set({ timerDuration: duration })
  }
  async setRestDuration(duration) {
    this.chrome.storage.sync.set({ restDuration: duration })
  }
  async setPushDesktopNotification(boolean) {
    this.chrome.storage.sync.set({ pushDesktopNotification: boolean })
  }
  async setPlaySoundNotification(boolean) {
    this.chrome.storage.sync.set({ playSoundNotification: boolean })
  }
  async setHasNotifiedLookAway(boolean) {
    this.chrome.storage.sync.set({ hasNotifiedLookAway: boolean })
  }
  async setHasNotifiedLookBack(boolean) {
    this.chrome.storage.sync.set({ hasNotifiedLookBack: boolean })
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
