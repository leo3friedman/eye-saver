export class StorageManager {
  /**
   *
   * Instiantiate a new StorageManager
   *
   * @param {object} chrome local chrome instance
   * @param {boolean} allowImports set to false if running in a service_worker
   * @param {object} enums enums used if running in a service_worker
   */
  constructor(chrome, allowImports = true, enums = null) {
    if (!enums && !allowImports)
      throw new Error(
        'enums required for StorageManager running in a service_worker'
      )

    this.chrome = chrome
    this.allowImports = allowImports
    this.enums = enums
  }

  async loadEnums() {
    if (this.enums !== null) return

    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }

  async getEnums() {
    if (this.enums !== null) return this.enums

    return await import(this.chrome.runtime.getURL('enums.js'))
  }

  /**
   *
   * STORAGE GETTERS
   *
   */

  async getTimerDuration() {
    await this.loadEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.timerDuration))
      })
    })
  }

  async getRestDuration() {
    await this.loadEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Number(result.restDuration))
      })
    })
  }

  async getIsRunning() {
    await this.loadEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.isRunning))
      })
    })
  }

  async getPushDesktopNotification() {
    await this.loadEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.pushDesktopNotification))
      })
    })
  }

  async getPlaySoundNotification() {
    await this.loadEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(Boolean(result.playSoundNotification))
      })
    })
  }

  async getAlarm() {
    await this.loadEnums()
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(this.enums.defaults, (result) => {
        resolve(result.alarm)
      })
    })
  }

  async getTimeUntilAlarm() {
    const alarm = await this.getAlarm()
    if (!alarm) return -1
    return Number(alarm?.scheduledTime) - Date.now()
  }

  async getRestDurationRemaining() {
    const timeUntilAlarm = await this.getTimeUntilAlarm()

    // case where there is no alarm
    if (timeUntilAlarm < 0) return -1

    const timerDuration = await this.getTimerDuration()

    return timeUntilAlarm - timerDuration

  }

  /**
   *
   * STORAGE SETTERS
   *
   */

  async setAlarm(alarm) {
    await this.chrome.storage.sync.set({ alarm: alarm })
  }

  async setTimerDuration(duration) {
    await this.chrome.storage.sync.set({ timerDuration: duration })
  }

  async setRestDuration(duration) {
    await this.chrome.storage.sync.set({ restDuration: duration })
  }

  async setPushDesktopNotification(newValue) {
    await this.chrome.storage.sync.set({ pushDesktopNotification: newValue })
  }

  async setPlaySoundNotification(newValue) {
    await this.chrome.storage.sync.set({ playSoundNotification: newValue })
  }

  async incrementTimerDuration(increase = true) {
    const duration = await this.getTimerDuration()
    const enums = await this.getEnums()
    const { timerDurationIncrement, maxTimerDuration, minTimerDuration } =
      enums.constants

    const newDuration = increase
      ? Math.min(maxTimerDuration, duration + timerDurationIncrement)
      : Math.max(minTimerDuration, duration - timerDurationIncrement)

    const rounded =
      Math.ceil(newDuration / timerDurationIncrement) * timerDurationIncrement

    await this.setTimerDuration(rounded)

    return rounded
  }

  async incrementRestDuration(increase = true) {
    const duration = await this.getRestDuration()
    const enums = await this.getEnums()
    const { restDurationIncrement, maxRestDuration, minRestDuration } =
      enums.constants

    const newDuration = increase
      ? Math.min(maxRestDuration, duration + restDurationIncrement)
      : Math.max(minRestDuration, duration - restDurationIncrement)

    const rounded =
      Math.ceil(newDuration / restDurationIncrement) * restDurationIncrement

    await this.setRestDuration(rounded)

    return rounded
  }
}
