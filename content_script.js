function handleStateChange(oldValue, newValue) {
  console.log('state changed')
}

function handleTimerDurationChange(oldValue, newValue) {
  console.log('timer duration changed')
}

function handleRestDurationChange(oldValue, newValue) {
  console.log('rest duration changed')
}

/**
 * Handles changes to storage.
 * Storage can be modified by service_worker (if an alarm goes off) or by the popup via user input.
 *
 * @param key
 * @param oldValue
 * @param newValue
 *
 */
function handleChange(key, oldValue, newValue) {
  switch (key) {
    case 'state':
      handleStateChange(oldValue, newValue)
      break
    case 'timerDuration':
      handleTimerDurationChange(oldValue, newValue)
      break
    case 'restDuration':
      handleRestDurationChange(oldValue, newValue)
      break
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    handleChange(key, oldValue, newValue)
  }
})

window.onload = () => {}
