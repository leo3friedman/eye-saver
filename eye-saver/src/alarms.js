export class AlarmHandler {
  constructor(storage = null) {
    this.storage = storage
    this.alarms = []
    this.alarmThreshold = 1000 * 10
  }

  async getCurrentPeriodProgress() {
    const { timerDuration, restDuration, sessionStart } =
      await this.storage.getTimerProperties()

    const periodLength = timerDuration + restDuration
    const periodProgress = (Date.now() - sessionStart) % periodLength

    return periodProgress
  }

  async getTimeUntilNextAlarm() {
    const { timerDuration } = await this.storage.getTimerProperties()
    const periodProgress = await this.getCurrentPeriodProgress()
    const restDurationRemaining = await this.getRestDurationRemaining()

    const timeUntilNextAlarm =
      periodProgress < timerDuration
        ? timerDuration - periodProgress
        : timerDuration + restDurationRemaining

    return timeUntilNextAlarm
  }

  async isResting() {
    const running = await this.storage.isExtensionRunning()

    const { restDuration } = await this.storage.getTimerProperties()
    const restDurationRemaining = await this.getRestDurationRemaining()

    return running && restDuration - restDurationRemaining >= 0
  }

  async getRestDurationRemaining() {
    const { timerDuration, restDuration } =
      await this.storage.getTimerProperties()

    const periodProgress = await this.getCurrentPeriodProgress()

    const restDurationRemaining = Math.max(
      timerDuration + restDuration - periodProgress,
      0
    )

    return restDurationRemaining
  }

  async createTimerAlarm(callback) {
    const alarmId = Math.random().toString(16).slice(2)

    const duration = await this.getTimeUntilNextAlarm()

    const alarmCallback = () => this.onTimerAlarm(alarmId, callback)

    const alarm = {
      id: alarmId,
      timeout: setTimeout(alarmCallback, duration),
      expectedTime: Date.now() + duration,
    }
    this.alarms.push(alarm)
  }

  createSimpleAlarm(callback, duration) {
    const alarmId = Math.random().toString(16).slice(2)

    const alarmCallback = () => {
      callback()
      this.removeAlarm(alarmId)
    }

    const alarm = {
      id: alarmId,
      timeout: setTimeout(alarmCallback, duration),
      expectedTime: Date.now() + duration,
    }
    this.alarms.push(alarm)
  }

  clearAlarms() {
    this.alarms.map(({ timeout }) => clearTimeout(timeout))
    this.alarms = []
  }

  removeAlarm(alarmId) {
    this.alarms = this.alarms.filter(({ id }) => id !== alarmId)
  }

  async onTimerAlarm(alarmId, callback) {
    const isRunning = await this.storage.isExtensionRunning()

    if (!isRunning) return

    const { expectedTime } = this.alarms.find(({ id }) => id === alarmId)

    const withinThreshold =
      Math.abs(Date.now() - expectedTime) < this.alarmThreshold

    if (withinThreshold) callback()

    this.removeAlarm(alarmId)
    this.createTimerAlarm(callback)
  }
}
