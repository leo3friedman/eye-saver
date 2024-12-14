window.onload = async () => {
  const { getTimerProperties, storage } = await import(
    chrome.runtime.getURL('src/storage.js')
  )
  const { timerDuration, restDuration } = await getTimerProperties()

  const inputs = {
    timerDurationInput: document.querySelector('#test-timer-duration-input'),
    restDurationInput: document.querySelector('#test-rest-duration-input'),
  }

  inputs.timerDurationInput.value = timerDuration
  inputs.restDurationInput.value = restDuration

  inputs.timerDurationInput.onchange = (event) => {
    storage.setTimerDuration(Number(event.target.value))
  }

  inputs.restDurationInput.onchange = (event) => {
    storage.setRestDuration(Number(event.target.value))
  }

  const openInstallOnboardingButton = document.querySelector(
    '.open-install-onboarding-button'
  )
  const openUpdateOnboardingButton = document.querySelector(
    '.open-update-onboarding-button'
  )
  openInstallOnboardingButton.onclick = () => {
    chrome.tabs.create({
      url: 'src/onboarding.html',
    })
  }

  openUpdateOnboardingButton.onclick = () => {
    const version = chrome.runtime.getManifest()?.version
    if (['0.8.4'].includes(version)) {
      chrome.tabs.create({
        url: `src/update${version}.html`,
      })
    } else {
      alert('wrong version!')
    }
  }
}
