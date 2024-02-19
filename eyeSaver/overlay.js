function destroyOverlay() {
  document
    .querySelectorAll('.eye-saver__overlay')
    .forEach((canvas) => document.body.removeChild(canvas))
}

async function renderOverlay(totalDuration, timePassed) {
  const timerTemplateUrl = chrome.runtime.getURL('overlay.html')
  const xhr = new XMLHttpRequest()

  xhr.onload = async () => {
    document.body.insertAdjacentHTML('afterbegin', xhr.response)
    const timerSrc = await import(chrome.runtime.getURL('templates/timer.js'))
    const dropzone = document.querySelector('.timer__dropzone')
    const skipButton = document.querySelector('.eye-saver__skip-button')

    skipButton.onclick = () => {
      destroyOverlay()
    }

    const timer = new timerSrc.Timer(
      totalDuration,
      0,
      timePassed,
      true,
      false,
      destroyOverlay,
      null
    )

    timer.renderTimer(dropzone)
  }
  xhr.open('GET', timerTemplateUrl)
  xhr.send()
}

window.onload = async () => {
  const enums = await import(chrome.runtime.getURL('enums.js'))

  chrome.storage.sync.get(enums.defaults, (result) => {
    const restDuration = Number(result.restDuration)
    const restStart = Number(result.restStart)
    const timePassed = Date.now() - restStart

    timePassed < restDuration
      ? renderOverlay(restDuration, timePassed)
      : destroyOverlay()
  })
}

chrome.storage.onChanged.addListener(async (changes) => {
  const newRestStart = changes?.restStart?.newValue

  if (!newRestStart || newRestStart < 0) {
    destroyOverlay()
    return
  }

  const enums = await import(chrome.runtime.getURL('enums.js'))
  chrome.storage.sync.get(enums.defaults, (result) => {
    const restDuration = Number(result.restDuration)
    const timePassed = Date.now() - Number(newRestStart)
    renderOverlay(restDuration, timePassed)
  })
})
