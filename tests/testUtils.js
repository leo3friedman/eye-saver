/**
 *
 * UTILS
 *
 */

const durationToMilliseconds = (hours, minutes, seconds) => {
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000
}

const getText = async (page, selector) => {
  await page.waitForSelector(selector)
  return page.$eval(selector, (el) => el.innerText)
}

const getTimerDuration = async (page) => {
  const timerText = await getText(page, '.timer-duration')
  const durations = timerText.split(':').map((d) => Number(d))
  return durationToMilliseconds(durations[0], durations[1], durations[2])
}

const totalElapsed = (timestamp) => {
  return Math.floor(Date.now() - timestamp)
}

const currentElapsed = (timestamp) => {
  return Math.floor(Date.now() - timestamp) % 15000
}

const clickElement = async (page, selector) => {
  await page.$eval(selector, (el) => el.click())
}

const inClassList = async (page, selector, className) => {
  return await page.$eval(
    selector,
    (el, className) => {
      return el.classList.contains(className)
    },
    className
  )
}

const withinError = (current, expected, error) => {
  return current <= expected + error && current >= expected - error
}

/**
 *
 * ASSERTIONS
 *
 */

/**
 *
 * @param {*} page
 * @param {number[]} expectedDuration expected duration (ms)
 * @param {number} error allowed margin of error (ms)
 */
const assertDuration = async (page, expectedDuration, error = 0) => {
  const duration = await getTimerDuration(page)
  //   expect(withinError(duration, expectedDuration, error)).toBe(true)
  expect(duration).toBeGreaterThanOrEqual(expectedDuration - error)
  expect(duration).toBeLessThanOrEqual(expectedDuration + error)
}

const assertInClassList = async (page, selector, className) => {
  const includesClass = await inClassList(page, selector, className)
  expect(includesClass).toBe(true)
}

const assertNotInClassList = async (page, selector, className) => {
  const includesClass = await inClassList(page, selector, className)
  expect(includesClass).toBe(false)
}

if (typeof module !== 'undefined') {
  module.exports = {
    assertDuration,
    totalElapsed,
    currentElapsed,
    clickElement,
    assertInClassList,
    assertNotInClassList,
    withinError,
  }
}
