export class EyeSaver {
  /**
   *
   * @param {any} chrome
   * @param {()=>void} onResting
   */
  constructor(chrome, onResting = null) {
    this.chrome = chrome

    chrome.runtime.onMessage.addListener(async (message) => {
      await this.importEnums()

      // TODO: get enums in here
      if (message === this.enums.messages.ACTIVATE) {
        console.log('activated read in the content script!!')
        if (false && onResting) {
          onResting()
        }
      }
    })
  }

  async importEnums() {
    this.enums = await import(this.chrome.runtime.getURL('enums.js'))
  }
}
